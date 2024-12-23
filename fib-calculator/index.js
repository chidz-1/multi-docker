require("dotenv").config();
const redis = require("redis");

const { REDIS_PORT, REDIS_HOST } = process.env;

function calculateFibonacciValue(index) {
	if (index < 2) return 1;
	return (
		calculateFibonacciValue(index - 1) + calculateFibonacciValue(index - 2)
	);
}

const redisClient = redis.createClient({
	host: REDIS_HOST,
	port: REDIS_PORT,
	retry_strategy: () => 1000,
});

const redisSubscriber = redisClient.duplicate();

redisSubscriber.on("message", (channel, hashIndexMessage) => {
	console.log("[[inside fib-calculator]]", channel, hashIndexMessage);
	redisClient.hset(
		"values",
		hashIndexMessage,
		calculateFibonacciValue(parseInt(hashIndexMessage))
	);
});

redisSubscriber.subscribe("insert");
