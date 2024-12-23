require("dotenv").config();
const { Pool } = require("pg");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const redis = require("redis");

const FIBONACCI_CALC_LIMIT = {
	index: 40,
	errorMessage: `Your fibonacci index of ${this.index} is too high`,
};

const APP_PORT = 5000;

// Express "Server" set-up
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres "Client" setup
const {
	PG_USER,
	PG_HOST,
	PG_DATABASE,
	PG_PASSWORD,
	PG_PORT,
	REDIS_PORT,
	REDIS_HOST,
} = process.env;

const pgClient = new Pool({
	user: PG_USER,
	host: PG_HOST,
	database: PG_DATABASE,
	password: PG_PASSWORD,
	port: PG_PORT,
	ssl:
		process.env.NODE_ENV !== "production"
			? false
			: { rejectUnauthorized: false },
});

pgClient.on("connect", (client) => {
	client
		.query("CREATE TABLE IF NOT EXISTS values (number INT)")
		.catch((err) => console.error(err));
});

// Redis "Client" setup
const redisClient = redis.createClient({
	host: REDIS_HOST,
	port: REDIS_PORT,
	retry_strategy: () => 1000,
});

const redisPublisher = redisClient.duplicate();

// Express route handlers

// Return homepage...
app.get("/", (_, res) => {
	res.send("Hi");
});

// Return all fibonacci indices from the postgres database...
app.get("/values/indices", async (_, res) => {
	// const values = await pgClient.query("SELECT * from values");
	res.send([1, 0, 1, 0, 1]); // N.B. values.rows strips metadata from the DB query response and only returns the actual values
});

// Return all previous fibonacci calculations (indices & values)...
app.get("/values/calculations", async (_, res) => {
	redisClient.hgetall("values", (err, values) => {
		res.send(values || {});
	});
});

// Store the pending fibonacci index to be calculated in Redis hash, trigger a redis publish event so the fib-calculator service
// will do the calculation and store it in the same redis hash index as a matching value, then finally save the fibonacci index only in
// postgres.
app.post("/values", async (req, res) => {
	const { index } = req.body;

	if (parseInt(index) > FIBONACCI_CALC_LIMIT.index) {
		return res.status(422).send(FIBONACCI_CALC_LIMIT.errorMessage);
	}

	// Redis
	redisClient.hset("values", index, "[Pending calculation]");
	redisPublisher.publish("insert", index, (err, reply) =>
		console.log("[[redis publisher cb]]", err, reply)
	);

	// Postgres
	// pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

	res.send({ working: true }); // arbitrary response
});

app.listen(APP_PORT, (_) => {
	console.log(`Listening on port ${APP_PORT}`);
});
