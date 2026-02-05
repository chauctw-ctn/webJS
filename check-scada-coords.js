const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./monitoring.db');

console.log('=== Checking SCADA station coordinates ===\n');

db.all(`
    SELECT station_id, station_name, lat, lng 
    FROM stations 
    WHERE station_type = "SCADA" 
    ORDER BY station_name
`, [], (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.table(rows);
        console.log(`\nTotal SCADA stations: ${rows.length}`);
        const withCoords = rows.filter(r => r.lat && r.lng);
        console.log(`Stations with coordinates: ${withCoords.length}`);
    }
    db.close();
});
