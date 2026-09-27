/* SmartBags — backend helpers shared by every /api route.
   Storage: Upstash Redis, connected via the Vercel Marketplace (two
   keys — one JSON blob for store data, one for the orders list). Auth:
   a single admin password kept in the ADMIN_PASSWORD environment
   variable; the admin panel sends it back as "Authorization: Bearer
   <password>" on every protected request. */

const { Redis } = require('@upstash/redis');
const DEFAULT_DATA = require('./_defaults');

/* The Vercel Marketplace Upstash integration injects KV_REST_API_URL /
   KV_REST_API_TOKEN by default; some setups use the Upstash-native
   names instead, so accept either. */
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
});

const DATA_KEY = 'smartbags:data';
const ORDERS_KEY = 'smartbags:orders';
const EXPENSES_KEY = 'smartbags:expenses';

async function readData() {
  const raw = await redis.get(DATA_KEY);
  if (!raw) return DEFAULT_DATA;
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    console.error('SmartBags: corrupt data in store, falling back to defaults', e);
    return DEFAULT_DATA;
  }
}

async function writeData(data) {
  await redis.set(DATA_KEY, JSON.stringify(data));
}

async function readOrders() {
  const raw = await redis.get(ORDERS_KEY);
  if (!raw) return [];
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    console.error('SmartBags: corrupt orders in store, resetting to empty', e);
    return [];
  }
}

async function writeOrders(orders) {
  await redis.set(ORDERS_KEY, JSON.stringify(orders));
}

async function readExpenses() {
  const raw = await redis.get(EXPENSES_KEY);
  if (!raw) return [];
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    console.error('SmartBags: corrupt expenses in store, resetting to empty', e);
    return [];
  }
}

async function writeExpenses(expenses) {
  await redis.set(EXPENSES_KEY, JSON.stringify(expenses));
}

/* True only when ADMIN_PASSWORD is configured and the caller sent it
   as a Bearer token. */
function isAdmin(req) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  return Boolean(process.env.ADMIN_PASSWORD) && token === process.env.ADMIN_PASSWORD;
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/* Vercel usually parses a JSON body into req.body automatically, but
   falls back to a raw string in some edge cases — normalise it here. */
function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return req.body;
}

module.exports = { readData, writeData, readOrders, writeOrders, readExpenses, writeExpenses, isAdmin, setCors, parseBody };
