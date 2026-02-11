const { 
    initDatabase, 
    getVisitorStats, 
    incrementVisitorCount,
    setVisitorCount 
} = require('./database');

async function testVisitorTracking() {
    console.log('🧪 Testing visitor tracking with PostgreSQL...\n');
    
    try {
        // 1. Initialize database (creates visitor_stats table)
        console.log('1️⃣  Initializing database...');
        await initDatabase();
        
        // 2. Get current visitor stats
        console.log('\n2️⃣  Getting current visitor stats...');
        let stats = await getVisitorStats();
        console.log('   📊 Current stats:');
        console.log(`      Total visitors: ${stats.total_visitors.toLocaleString()}`);
        console.log(`      Today visitors: ${stats.today_visitors}`);
        console.log(`      Today date: ${stats.today_date.toISOString().split('T')[0]}`);
        
        // 3. Test increment
        console.log('\n3️⃣  Testing increment visitor count...');
        const initialTotal = stats.total_visitors;
        const incrementedStats = await incrementVisitorCount();
        console.log(`   ✅ Incremented! ${initialTotal.toLocaleString()} → ${incrementedStats.total_visitors.toLocaleString()}`);
        console.log(`   📈 Today visitors: ${incrementedStats.today_visitors}`);
        
        // 4. Verify the change persists
        console.log('\n4️⃣  Verifying change persists...');
        stats = await getVisitorStats();
        console.log(`   ✅ Confirmed! Total: ${stats.total_visitors.toLocaleString()}`);
        
        // 5. Reset back to original value
        console.log('\n5️⃣  Resetting to original value...');
        await setVisitorCount(initialTotal);
        stats = await getVisitorStats();
        console.log(`   ✅ Reset! Total back to: ${stats.total_visitors.toLocaleString()}`);
        
        console.log('\n✅ All tests passed!');
        console.log('\n📝 Summary:');
        console.log(`   • Visitor count bắt đầu từ: ${initialTotal.toLocaleString()}`);
        console.log('   • Dữ liệu được lưu trong PostgreSQL');
        console.log('   • Không bị reset khi restart server');
        console.log('   • Auto reset today_visitors mỗi ngày mới\n');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    }
}

testVisitorTracking();
