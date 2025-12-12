const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./prisma/dev.db');

console.log('\n📊 Startup Ideas Database\n');

db.all('SELECT name, category, revenueModel, complexity, upvotes FROM StartupIdea ORDER BY upvotes DESC', [], (err, rows) => {
    if (err) {
        console.error('Error:', err);
        return;
    }

    console.log(`Total Ideas: ${rows.length}\n`);

    rows.forEach((row, i) => {
        console.log(`${i + 1}. ${row.name}`);
        console.log(`   Category: ${row.category}`);
        console.log(`   Revenue Model: ${row.revenueModel}`);
        console.log(`   Complexity: ${row.complexity}`);
        console.log(`   Upvotes: ${row.upvotes}`);
        console.log('');
    });

    db.close();
});
