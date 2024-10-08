// performanceMonitor.js
import redisClient from "@/libs/redis";

export default function performanceMonitor(cache) {
  return (req, res, next) => {
    const start = process.hrtime(); // Start time

    // Define cache name based on the incoming request
    let cacheName = cache;
    if (req.query && req.query.evalString) {
      cacheName += `:${eval(req.query.evalString)}`; // Dynamically set cache name
    }

    req.cacheName = cacheName;

    // Check for cache hit in Redis
    if (redisClient.connected) {
      return redisClient.get(cacheName, (err, data) => {
        if (err) {
          return res.status(500).send(err);
        }
        if (data !== null) {
          const parsedData = JSON.parse(data);
          const elapsedTime = process.hrtime(start);
          const responseTime = elapsedTime[0] * 1000 + elapsedTime[1] / 1e6; // Convert to milliseconds

          console.log(
            `[${req.method}] ${req.originalUrl} -: ${responseTime.toFixed(
              2
            )} ms `
          );
          return res.status(200).send(parsedData);
        }
        // If no cache hit, proceed to the next middleware or route handler
        next();
      });
    }

    next();
  };
}
