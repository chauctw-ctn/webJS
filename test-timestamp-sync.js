// Test đồng bộ timestamp cho nhiều parameters
const { pool, saveTVAData, initDatabase } = require('./database');

async function testTimestampSync() {
    try {
        console.log('🧪 Testing timestamp synchronization for multiple parameters...\n');
        
        // Khởi tạo database nếu cần
        await initDatabase();
        
        // Test data với nhiều parameters
        const testData = [
            {
                station: 'TEST_SYNC_STATION',
                data: [
                    { name: 'Parameter 1', value: 10.5, unit: 'unit1' },
                    { name: 'Parameter 2', value: 20.3, unit: 'unit2' },
                    { name: 'Parameter 3', value: 30.7, unit: 'unit3' },
                    { name: 'Parameter 4', value: 40.2, unit: 'unit4' },
                    { name: 'Parameter 5', value: 50.9, unit: 'unit5' }
                ]
            }
        ];
        
        console.log('💾 Saving 5 parameters for one station...');
        await saveTVAData(testData);
        console.log('✅ Data saved!\n');
        
        // Query lại để check timestamps
        const result = await pool.query(`
            SELECT parameter_name, value, timestamp, update_time
            FROM tva_data
            WHERE station_name = 'TEST_SYNC_STATION'
            ORDER BY parameter_name
        `);
        
        if (result.rows.length > 0) {
            console.log('📊 Saved parameters with timestamps:\n');
            
            const timestamps = new Set();
            result.rows.forEach(row => {
                const ts = new Date(row.timestamp).toISOString();
                timestamps.add(ts);
                console.log(`   ${row.parameter_name.padEnd(15)} | ${row.value.toString().padEnd(8)} | ${ts}`);
            });
            
            console.log('\n✅ Verification:');
            console.log(`   Total parameters:     ${result.rows.length}`);
            console.log(`   Unique timestamps:    ${timestamps.size}`);
            console.log(`   First timestamp:      ${result.rows[0].timestamp}`);
            console.log(`   Last timestamp:       ${result.rows[result.rows.length - 1].timestamp}`);
            
            if (timestamps.size === 1) {
                console.log('\n✅ SUCCESS! Tất cả parameters có CÙNG timestamp (đồng bộ)');
            } else {
                console.log('\n⚠️ WARNING! Các parameters có timestamp KHÁC NHAU (không đồng bộ)');
                console.log(`   Unique timestamps: ${Array.from(timestamps).join(', ')}`);
            }
        } else {
            console.log('❌ No data found');
        }
        
        // Cleanup test data
        console.log('\n🗑️ Cleaning up test data...');
        await pool.query("DELETE FROM tva_data WHERE station_name = 'TEST_SYNC_STATION'");
        await pool.query("DELETE FROM stations WHERE station_id LIKE '%TEST_SYNC_STATION%'");
        console.log('✅ Test data cleaned up');
        
        await pool.end();
        console.log('\n✅ Test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testTimestampSync();
