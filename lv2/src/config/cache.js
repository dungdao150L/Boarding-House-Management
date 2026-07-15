const Redis = require('ioredis');

const logger = require('./logger');

const memoryCache = new Map();
let redisClient = null;
let redisDisabled = false;

function shouldUseRedis() {
  return Boolean(process.env.REDIS_URL) && process.env.NODE_ENV !== 'test' && !redisDisabled;
}

function getRedisClient() {
  if (!shouldUseRedis()) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL, {
      enableOfflineQueue: false,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });

    redisClient.on('error', (error) => {
      redisDisabled = true;
      logger.warn({ error: error.message }, 'Redis cache unavailable');
    });
  }

  return redisClient;
}

function getMemoryCache(key) {
  const cached = memoryCache.get(key);
  if (!cached || cached.expiresAt < Date.now()) {
    memoryCache.delete(key);
    return null;
  }

  return cached.value;
}

function setMemoryCache(key, value, ttlSeconds) {
  memoryCache.set(key, {
    expiresAt: Date.now() + ttlSeconds * 1000,
    value,
  });
}

function deleteMemoryCache(pattern) {
  const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
  [...memoryCache.keys()].forEach((key) => {
    if (regex.test(key)) {
      memoryCache.delete(key);
    }
  });
}

async function getCache(key) {
  const client = getRedisClient();

  if (client) {
    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      redisDisabled = true;
      logger.warn({ error: error.message }, 'Redis get failed, falling back to memory cache');
    }
  }

  return getMemoryCache(key);
}

async function setCache(key, value, ttlSeconds = 60) {
  const client = getRedisClient();

  if (client) {
    try {
      await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return;
    } catch (error) {
      redisDisabled = true;
      logger.warn({ error: error.message }, 'Redis set failed, falling back to memory cache');
    }
  }

  setMemoryCache(key, value, ttlSeconds);
}

async function deleteCache(pattern) {
  const client = getRedisClient();

  if (client) {
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return;
    } catch (error) {
      redisDisabled = true;
      logger.warn({ error: error.message }, 'Redis delete failed, falling back to memory cache');
    }
  }

  deleteMemoryCache(pattern);
}

module.exports = {
  deleteCache,
  getCache,
  setCache,
};
