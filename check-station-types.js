const db = require('./database');

(async () => {
    try {
        await db.initDatabase();
        const data = await db.getLatestStationsData();
        
        console.log('=== Station types in DB ===\n');
        
        const types = { TVA: 0, MQTT: 0, SCADA: 0, OTHER: 0 };
        
        Object.keys(data).forEach(name => {
            const type = data[name].type;
            console.log(`  ${name}: ${type}`);
            
            if (type === 'TVA') types.TVA++;
            else if (type === 'MQTT') types.MQTT++;
            else if (type === 'SCADA') types.SCADA++;
            else types.OTHER++;
        });
        
        console.log('\n=== Summary ===');
        console.log(`TVA: ${types.TVA}`);
        console.log(`MQTT: ${types.MQTT}`);
        console.log(`SCADA: ${types.SCADA}`);
        console.log(`OTHER: ${types.OTHER}`);
        console.log(`TOTAL: ${Object.keys(data).length}`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();
