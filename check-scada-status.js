const db = require('./database');

(async () => {
    try {
        await db.initDatabase();
        const data = await db.getLatestStationsData();
        
        console.log('=== SCADA Stations Status Check ===\n');
        
        const scadaStations = Object.keys(data).filter(name => data[name].type === 'SCADA');
        
        console.log(`Found ${scadaStations.length} SCADA stations:\n`);
        
        scadaStations.forEach(name => {
            const station = data[name];
            console.log(`Station: ${name}`);
            console.log(`  Type: ${station.type}`);
            console.log(`  Timestamp: ${station.timestamp}`);
            console.log(`  Update Time: ${station.updateTime}`);
            console.log(`  Data count: ${station.data ? station.data.length : 0}`);
            
            if (station.data && station.data.length > 0) {
                console.log(`  Parameters:`);
                station.data.forEach(param => {
                    console.log(`    - ${param.name}: ${param.value} ${param.unit || ''}`);
                });
            }
            
            // Check age
            if (station.timestamp) {
                const age = Date.now() - new Date(station.timestamp).getTime();
                const ageMinutes = age / (1000 * 60);
                console.log(`  Age: ${ageMinutes.toFixed(1)} minutes`);
            }
            console.log('');
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();
