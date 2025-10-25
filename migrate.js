const https = require('https');
const fs = require('fs');

const SUPABASE_URL = 'https://lftriblowcphjvzesflh.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmdHJpYmxvd2NwaGp2emVzZmxoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM1ODAwMSwiZXhwIjoyMDc2OTM0MDAxfQ.9qNKZP_fBc6PpLQua7I_9kSyYFzOYBHD91nksh8Iz7g';

// Read the migration SQL
const migrationSQL = fs.readFileSync('/home/user/scheduler/supabase-migration-reset.sql', 'utf8');

// Split into individual statements
const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

// Try using Supabase's query endpoint
async function executeSQL(sql) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ query: sql });

        const options = {
            hostname: 'lftriblowcphjvzesflh.supabase.co',
            path: '/rest/v1/rpc/exec_sql',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SERVICE_KEY,
                'Authorization': `Bearer ${SERVICE_KEY}`,
                'Prefer': 'return=representation'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({ success: true, data: body });
                } else {
                    resolve({ success: false, error: body, status: res.statusCode });
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

// Try alternative: direct SQL execution via pg library
async function tryWithPg() {
    const { Client } = require('pg');

    const configs = [
        {
            host: 'db.lftriblowcphjvzesflh.supabase.co',
            port: 5432,
            database: 'postgres',
            user: 'postgres',
            password: '22755270',
            ssl: { rejectUnauthorized: false }
        },
        {
            host: 'aws-0-us-east-1.pooler.supabase.com',
            port: 5432,
            database: 'postgres',
            user: 'postgres.lftriblowcphjvzesflh',
            password: '22755270',
            ssl: { rejectUnauthorized: false }
        },
        {
            host: 'aws-0-us-east-1.pooler.supabase.com',
            port: 6543,
            database: 'postgres',
            user: 'postgres.lftriblowcphjvzesflh',
            password: '22755270',
            ssl: { rejectUnauthorized: false }
        }
    ];

    for (let i = 0; i < configs.length; i++) {
        console.log(`\n🔄 Trying connection method ${i + 1}/${configs.length}...`);
        const client = new Client(configs[i]);

        try {
            await client.connect();
            console.log('✅ Connected successfully!\n');

            // Execute migration
            console.log('🚀 Executing migration...\n');
            await client.query(migrationSQL);
            console.log('✅ Migration completed successfully!\n');

            // Verify tables
            const result = await client.query(`
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
            `);

            console.log('📊 Created tables:');
            result.rows.forEach(row => console.log('  ✓', row.table_name));

            await client.end();
            return true;
        } catch (err) {
            console.log(`❌ Method ${i + 1} failed:`, err.message);
            try { await client.end(); } catch {}
        }
    }

    return false;
}

// Main execution
async function main() {
    console.log('🚀 Starting database migration...\n');

    // First, try with pg library
    try {
        const { Client } = require('pg');
        const success = await tryWithPg();
        if (success) {
            console.log('\n✅ MIGRATION COMPLETE!');
            process.exit(0);
        }
    } catch (err) {
        console.log('⚠️ pg library not available, trying alternative methods...\n');
    }

    // Try REST API approach
    console.log('🔄 Attempting REST API method...\n');
    const result = await executeSQL(statements[0]);
    console.log('Result:', result);

    console.log('\n❌ All automatic methods exhausted.');
    console.log('Please run the SQL manually in Supabase dashboard.');
    process.exit(1);
}

main().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
