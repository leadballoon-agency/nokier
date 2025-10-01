const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
    try {
        const sql = neon(process.env.DATABASE_URL);
        
        // Get total count
        const countResult = await sql`SELECT COUNT(*) as count FROM waitlist`;
        console.log(`\nTotal signups in database: ${countResult[0].count}`);
        
        // Get recent signups
        const recent = await sql`
            SELECT email, tier, queue_number, shares_count, timestamp 
            FROM waitlist 
            ORDER BY timestamp DESC 
            LIMIT 5
        `;
        
        console.log('\nRecent signups:');
        recent.forEach((row, i) => {
            console.log(`${i + 1}. ${row.email} - ${row.tier} - Queue #${row.queue_number} - ${row.shares_count} shares - ${row.timestamp}`);
        });
        
    } catch (error) {
        console.error('Database error:', error);
    }
}

checkDatabase();
