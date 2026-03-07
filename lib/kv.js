/**
 * KV client — ioredis wrapper with @vercel/kv-compatible API.
 *
 * Connects via the Redis URL env var (name varies depending on
 * how the store was named in the Vercel dashboard). Falls back
 * to KV_URL, then scans for any *REDIS_URL var.
 *
 * When no Redis URL is available (e.g. first deploy before KV is
 * provisioned), exports a no-op client so the build can succeed.
 *
 * For local dev, loads .env.local via dotenv.
 */

const path = require('path');

// Load .env.local when running locally (no-op if file missing)
try { require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') }); } catch {}

// Find the Redis URL from env vars
const redisUrl =
  process.env.KV_URL ||
  Object.values(
    Object.fromEntries(
      Object.entries(process.env).filter(([k]) => k.endsWith('REDIS_URL'))
    )
  )[0];

if (!redisUrl) {
  console.warn('Warning: No Redis URL found in environment. Using no-op KV client (build will skip dynamic posts).');

  /** No-op KV client — returns empty data so the build succeeds. */
  const kv = {
    async get() { return null; },
    async set() {},
    async del() {},
    async close() {},
  };

  module.exports = { kv };
  return;
}

const Redis = require('ioredis');
const redis = new Redis(redisUrl, { maxRetriesPerRequest: 3 });

/** @vercel/kv-compatible wrapper: values are JSON-serialised automatically. */
const kv = {
  async get(key) {
    const val = await redis.get(key);
    if (val === null) return null;
    try { return JSON.parse(val); } catch { return val; }
  },

  async set(key, value) {
    await redis.set(key, JSON.stringify(value));
  },

  async del(key) {
    await redis.del(key);
  },

  /** Disconnect from Redis. Call in CLI scripts to let the process exit. */
  async close() {
    await redis.quit();
  },
};

module.exports = { kv };
