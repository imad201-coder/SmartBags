/* SmartBags — backend helpers shared by every /api route.
   Storage: Vercel KV (two keys — one JSON blob for store data, one for
   the orders list). Auth: a single admin password kept in the
   ADMIN_PASSWORD environment variable; the admin panel sends it back
   as "Authorization: Bearer <password>" on every protected request. */

const { kv } = require('@vercel/kv');
const DEFAULT_DATA = require('./_defaults');

const DATA_KEY = 'smartbags:data';
const ORDERS_KEY = 'smartbags:orders';

async function readData() {
  const raw = await kv.get(DATA_KEY);
  if (!raw) return DEFAULT_DATA;
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    console.error('SmartBags: corrupt data in KV, falling back to defaults', e);
    return DEFAULT_DATA;
  }
}

async function writeData(data) {
  await kv.set(DATA_KEY, JSON.stringify(data));
}

async function readOrders() {
  const raw = await kv.get(ORDERS_KEY);
  if (!raw) return [];
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    console.error('SmartBags: corrupt orders in KV, resetting to empty', e);
    return [];
  }
}

async function writeOrders(orders) {
  await kv.set(ORDERS_KEY, JSON.stringify(orders));
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

module.exports = { readData, writeData, readOrders, writeOrders, isAdmin, setCors, parseBody };
