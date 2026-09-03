// netlify/functions/room.js
//
// Backs the game's Online mode. Each room's state is stored as a small JSON
// blob keyed by its 5-character room code, using Netlify Blobs — a
// zero-setup key/value store that's automatically available to any
// Netlify Function on a deployed site (no extra account or API key needed).
//
//   GET  /api/room?code=ABCDE   -> current room state (or null if none)
//   POST /api/room?code=ABCDE   -> overwrite room state with the JSON body
//
// The client (index.html) polls GET every ~1.5s while a match is in
// progress and POSTs whenever the local player makes a move.

const { getStore } = require('@netlify/blobs');

const STORE_NAME = 'freestyle-rooms';
const JSON_HEADERS = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };

exports.handler = async (event) => {
    const code = (event.queryStringParameters && event.queryStringParameters.code || '')
        .trim()
        .toUpperCase();

    if (!code) {
        return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Missing room code' }) };
    }

    const store = getStore(STORE_NAME);

    try {
        if (event.httpMethod === 'GET') {
            const data = await store.get(code, { type: 'json' });
            return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify(data ?? null) };
        }

        if (event.httpMethod === 'POST') {
            let payload;
            try {
                payload = JSON.parse(event.body || '{}');
            } catch (e) {
                return { statusCode: 400, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Invalid JSON body' }) };
            }
            await store.setJSON(code, payload);
            return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true }) };
        }

        if (event.httpMethod === 'DELETE') {
            await store.delete(code);
            return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true }) };
        }

        return { statusCode: 405, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
    } catch (err) {
        console.error('room function error:', err);
        return { statusCode: 500, headers: JSON_HEADERS, body: JSON.stringify({ error: 'Server error' }) };
    }
};
