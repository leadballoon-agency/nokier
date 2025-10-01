// API endpoint to add new waitlist signup
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const sql = neon(process.env.DATABASE_URL);
        const {
            email,
            tier,
            queueNumber,
            favoritePolicy,
            income,
            sharesCount,
            compliance,
            freeSpeechUpgrade
        } = req.body;

        // Validate required fields
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        // Check if email already exists
        const existing = await sql`
            SELECT id FROM waitlist WHERE email = ${email}
        `;

        if (existing.length > 0) {
            return res.status(409).json({
                error: 'Email already registered',
                exists: true
            });
        }

        // Insert new signup
        const result = await sql`
            INSERT INTO waitlist (
                email,
                tier,
                queue_number,
                favorite_policy,
                income,
                shares_count,
                compliance,
                free_speech_upgrade
            )
            VALUES (
                ${email},
                ${tier || 'TIER 2'},
                ${queueNumber || 0},
                ${favoritePolicy || ''},
                ${income || ''},
                ${sharesCount || 0},
                ${JSON.stringify(compliance || {})},
                ${freeSpeechUpgrade !== false}
            )
            RETURNING id, queue_number, timestamp
        `;

        // Get updated total count
        const countResult = await sql`SELECT COUNT(*) as count FROM waitlist`;
        const totalCount = parseInt(countResult[0].count);

        return res.status(201).json({
            success: true,
            id: result[0].id,
            queueNumber: result[0].queue_number,
            totalCount,
            timestamp: result[0].timestamp
        });

    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to add signup' });
    }
}
