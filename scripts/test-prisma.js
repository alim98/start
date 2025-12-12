// Test Prisma connection
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
});

async function test() {
    try {
        console.log('Testing Prisma connection...');
        const count = await prisma.startupIdea.count();
        console.log('✅ Connection successful!');
        console.log(`Found ${count} startup ideas`);

        const ideas = await prisma.startupIdea.findMany({
            take: 2,
            select: { name: true, category: true }
        });
        console.log('Sample ideas:', ideas);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
