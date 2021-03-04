const cfg = require('../config');
const redis = require('async-redis');

const redisClient = redis.createClient({
  host: process.env.RDHOST || cfg.redis.host || 'localhost',
  port: process.env.RDPORT || cfg.redis.port || 6379,
  pass: process.env.RDPASS || cfg.redis.pass || '12345'
});

module.exports = redisClient;

redisClient.on('ready', function () {
  console.log('Successfully connected to Redis-server');
});

redisClient.on('error', function () {
  console.log('Can\'t connect to Redis-server');
});

redisClient.on('end', function () {
  console.log('Redis client quit');
});
