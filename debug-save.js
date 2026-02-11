// Test debug chi tiết lỗi khi lưu
const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres.llehbswibzhtsqgdulux:CR0kEeWlb8vemvuz@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres';

async function debugSave() {
    const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        options: '-c TimeZone=Asia/Ho_Chi_Minh'
    });

    const client = await pool.connect();
    
    try {
        console.log('🔧 Setting timezone...');
        await client.query("SET TIMEZONE='Asia/Ho_Chi_Minh'");
        
        console.log('⏰ Getting timestamp...');
        const stationTimestamp = (await client.query('SELECT CURRENT_TIMESTAMP as ts')).rows[0].ts;
        console.log('   Timestamp:', stationTimestamp);
        
        console.log('\n💾 Trying to INSERT...');
        const result = await client.query(
            `INSERT INTO tva_data (station_name, station_id, parameter_name, value, unit, timestamp, update_time)
             VALUES ($1, $2, $3, $4, $5, $6, $6)`,
            ['TEST_DEBUG', 'tva_TEST_DEBUG', 'Test Param', 99.9, 'test', stationTimestamp]
        );
        
        console.log('✅ INSERT successful!');
        console.log('   Result:', result);
        
        // Query back
        console.log('\n📊 Querying back...');
        const query = await client.query(
            "SELECT * FROM tva_data WHERE station_name = 'TEST_DEBUG'"
        );
        console.log('   Found:', query.rows.length, 'rows');
        console.log('   Data:', query.rows[0]);
        
        // Cleanup
        await client.query("DELETE FROM tva_data WHERE station_name = 'TEST_DEBUG'");
        
        console.log('\n✅ Test passed!');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Code:', error.code);
        console.error('Detail:', error.detail);
        console.error('Stack:', error.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

debugSave();
