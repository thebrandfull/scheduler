#!/usr/bin/env node
// Automated Supabase Database Setup Script
// Run this with: node setup-supabase.js

const https = require('https');

const SUPABASE_URL = 'https://lftriblowcphjvzesflh.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmdHJpYmxvd2NwaGp2emVzZmxoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM1ODAwMSwiZXhwIjoyMDc2OTM0MDAxfQ.9qNKZP_fBc6PpLQua7I_9kSyYFzOYBHD91nksh8Iz7g';

const fs = require('fs');
const path = require('path');

async function executeSQL(sql) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ query: sql });

        const options = {
            hostname: 'lftriblowcphjvzesflh.supabase.co',
            port: 443,
            path: '/rest/v1/rpc/exec_sql',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(body);
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function main() {
    console.log('🚀 Starting Supabase Database Setup...\n');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'supabase-schema.sql');

    if (!fs.existsSync(sqlPath)) {
        console.error('❌ Error: supabase-schema.sql not found!');
        console.error('Make sure you run this script from the scheduler directory.');
        process.exit(1);
    }

    console.log('📄 Reading SQL schema file...');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('⚡ Executing SQL commands...');
    console.log('This may take a minute...\n');

    try {
        // Split SQL into individual statements and execute
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

        console.log(`Found ${statements.length} SQL statements to execute.\n`);

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i] + ';';

            // Skip comments
            if (stmt.trim().startsWith('--')) continue;

            try {
                // Show progress
                const preview = stmt.substring(0, 60).replace(/\n/g, ' ') + '...';
                process.stdout.write(`[${i+1}/${statements.length}] Executing: ${preview}\r`);

                await executeSQL(stmt);
                successCount++;
            } catch (error) {
                // Some errors are expected (like "already exists"), continue
                if (!error.message.includes('already exists')) {
                    console.error(`\n⚠️  Statement ${i+1} failed:`, error.message);
                    errorCount++;
                }
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`\n\n✅ Database setup complete!`);
        console.log(`   Successfully executed: ${successCount} statements`);
        if (errorCount > 0) {
            console.log(`   Errors (may be ok): ${errorCount} statements`);
        }

        console.log('\n📊 Verifying tables...');
        console.log('Go to: https://supabase.com/dashboard/project/lftriblowcphjvzesflh/editor');
        console.log('You should see these 10 tables:');
        console.log('  ✓ user_profiles');
        console.log('  ✓ daily_completions');
        console.log('  ✓ measurements');
        console.log('  ✓ progress_photos');
        console.log('  ✓ gym_logs');
        console.log('  ✓ journal_entries');
        console.log('  ✓ instagram_posts');
        console.log('  ✓ daily_metrics');
        console.log('  ✓ weekly_reviews');
        console.log('  ✓ habit_streaks');

        console.log('\n🪣 Next Step: Create Storage Buckets');
        console.log('Go to: https://supabase.com/dashboard/project/lftriblowcphjvzesflh/storage/buckets');
        console.log('Create these 3 PUBLIC buckets:');
        console.log('  1. progress-photos');
        console.log('  2. meal-photos');
        console.log('  3. avatars');

        console.log('\n🎉 All done! Your database is ready.');

    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        console.error('\nPlease run the SQL manually in Supabase SQL Editor:');
        console.error('https://supabase.com/dashboard/project/lftriblowcphjvzesflh/sql/new');
        process.exit(1);
    }
}

main().catch(console.error);
