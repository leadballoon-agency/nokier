// API endpoint to get current waitlist count
const { neon } = require('@neondatabase/serverless');

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const sql = neon(process.env.DATABASE_URL);
        const result = await sql`SELECT COUNT(*) as count FROM waitlist`;
        const count = parseInt(result[0].count);

        return res.status(200).json({ count });
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to fetch waitlist count' });
    }
}
