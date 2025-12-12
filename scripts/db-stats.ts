import { getStats } from '../lib/idea-database';

/**
 * Display database statistics
 */
async function main() {
    console.log('📊 Database Statistics\n');

    const stats = await getStats();

    console.log(`Total Ideas: ${stats.total}\n`);

    console.log('By Source:');
    stats.bySource.forEach(s => {
        console.log(`  ${s.source}: ${s._count}`);
    });

    console.log('\nBy Category:');
    stats.byCategory.forEach(c => {
        console.log(`  ${c.category}: ${c._count}`);
    });

    console.log('\nBy Industry:');
    stats.byIndustry.forEach(i => {
        console.log(`  ${i.industry}: ${i._count}`);
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
