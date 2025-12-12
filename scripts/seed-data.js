const { PrismaClient } = require('@prisma/client');
const https = require('https');

// Sample data - real successful startups
const startupIdeas = [
    {
        name: "Notion",
        tagline: "All-in-one workspace for notes and collaboration",
        description: "Notion is a collaboration platform with modified Markdown support that integrates kanban boards, tasks, wikis, and databases. It's an all-in-one workspace for note-taking, knowledge management, and project management. Used by millions worldwide.",
        category: "Productivity",
        industry: "SaaS",
        targetMarket: JSON.stringify(["Global", "North America", "Europe"]),
        stage: "mature",
        website: "https://notion.so",
        upvotes: 15000,
        users: 20000000,
        revenue: "$100M+",
        funding: "$343M",
        techStack: JSON.stringify(["react", "typescript", "postgresql", "redis"]),
        requiresML: false,
        requiresBlockchain: false,
        complexity: "high",
        revenueModel: "freemium",
        pricing: "$8-16/user/month",
        uniqueValue: "Flexible blocks-based system combining multiple productivity tools",
        moat: "Strong network effects, high switching costs, extensive integrations",
        source: "curated",
        sourceUrl: "https://notion.so"
    },
    {
        name: "Stripe",
        tagline: "Payment infrastructure for the internet",
        description: "Stripe is a technology company that builds economic infrastructure for the internet. Businesses of every size use Stripe's software to accept payments and manage their businesses online. Developer-first API with excellent documentation.",
        category: "Fintech",
        industry: "Fintech",
        targetMarket: JSON.stringify(["Global"]),
        stage: "mature",
        website: "https://stripe.com",
        upvotes: 12000,
        revenue: "$7.4B",
        funding: "$2.2B",
        techStack: JSON.stringify(["ruby", "javascript", "postgresql", "redis", "kafka"]),
        requiresML: true,
        requiresBlockchain: false,
        complexity: "high",
        revenueModel: "transaction",
        pricing: "2.9% + 30¢ per transaction",
        uniqueValue: "Developer-first payment API with global reach",
        moat: "Network effects, regulatory compliance, brand trust, switching costs",
        source: "curated",
        sourceUrl: "https://stripe.com"
    },
    {
        name: "Figma",
        tagline: "Collaborative interface design tool",
        description: "Figma is a collaborative web application for interface design. The feature set focuses on UI/UX design with real-time collaboration. Acquired by Adobe for $20B, used by millions of designers worldwide.",
        category: "Design",
        industry: "SaaS",
        targetMarket: JSON.stringify(["Global"]),
        stage: "mature",
        website: "https://figma.com",
        upvotes: 18000,
        users: 4000000,
        revenue: "$400M+",
        funding: "$332M",
        techStack: JSON.stringify(["typescript", "react", "webgl", "rust"]),
        requiresML: false,
        requiresBlockchain: false,
        complexity: "high",
        revenueModel: "freemium",
        pricing: "$12-45/editor/month",
        uniqueValue: "Real-time collaboration in browser-based design tool",
        moat: "Strong network effects, high switching costs, file format lock-in",
        source: "curated",
        sourceUrl: "https://figma.com"
    },
    {
        name: "Vercel",
        tagline: "Platform for frontend developers",
        description: "Vercel is the platform for frontend developers, providing speed and reliability. Deploy apps in seconds with automatic scaling, DDoS protection, and global CDN. Creators of Next.js framework.",
        category: "Developer Tools",
        industry: "SaaS",
        targetMarket: JSON.stringify(["Global"]),
        stage: "growing",
        website: "https://vercel.com",
        upvotes: 8500,
        revenue: "$100M+",
        funding: "$313M",
        techStack: JSON.stringify(["next.js", "react", "node.js", "rust"]),
        requiresML: false,
        requiresBlockchain: false,
        complexity: "high",
        revenueModel: "freemium",
        pricing: "$20-40/user/month",
        uniqueValue: "Instant global deployments with edge network",
        moat: "Next.js ecosystem, developer experience, edge infrastructure",
        source: "curated",
        sourceUrl: "https://vercel.com"
    },
    {
        name: "Linear",
        tagline: "Issue tracking for modern software teams",
        description: "Linear is a project management tool designed for software teams. It helps track issues, plan sprints, and build products. Built for speed with keyboard shortcuts and clean interface. Used by top tech companies.",
        category: "Productivity",
        industry: "SaaS",
        targetMarket: JSON.stringify(["Global"]),
        stage: "growing",
        website: "https://linear.app",
        upvotes: 9200,
        users: 100000,
        funding: "$52M",
        techStack: JSON.stringify(["typescript", "react", "graphql", "postgresql"]),
        requiresML: false,
        requiresBlockchain: false,
        complexity: "medium",
        revenueModel: "subscription",
        pricing: "$8-16/user/month",
        uniqueValue: "Fastest issue tracker with keyboard-first design",
        moat: "Superior UX, workflow automation, team habits",
        source: "curated",
        sourceUrl: "https://linear.app"
    },
    {
        name: "Superhuman",
        tagline: "The fastest email experience ever made",
        description: "Superhuman is a premium email client for high-performing teams. Blazingly fast, delightful to use, with AI-powered features like email triage and follow-up reminders. $30/month premium positioning.",
        category: "Productivity",
        industry: "SaaS",
        targetMarket: JSON.stringify(["North America", "Europe"]),
        stage: "growing",
        website: "https://superhuman.com",
        upvotes: 7800,
        revenue: "$20M+",
        funding: "$108M",
        techStack: JSON.stringify(["react", "node.js", "postgresql", "redis"]),
        requiresML: true,
        requiresBlockchain: false,
        complexity: "medium",
        revenueModel: "subscription",
        pricing: "$30/user/month",
        uniqueValue: "Premium email experience with AI and speed focus",
        moat: "Brand positioning, user habits, premium market",
        source: "curated",
        sourceUrl: "https://superhuman.com"
    },
    {
        name: "Loom",
        tagline: "Async video messaging for work",
        description: "Loom is a video messaging tool for async communication. Record camera, microphone, and desktop simultaneously, then share instantly. Used by 14M+ users for remote collaboration.",
        category: "Productivity",
        industry: "SaaS",
        targetMarket: JSON.stringify(["Global"]),
        stage: "mature",
        website: "https://loom.com",
        upvotes: 11000,
        users: 14000000,
        revenue: "$100M+",
        funding: "$203M",
        techStack: JSON.stringify(["react", "node.js", "webrtc", "ffmpeg"]),
        requiresML: true,
        requiresBlockchain: false,
        complexity: "high",
        revenueModel: "freemium",
        pricing: "$8-16/user/month",
        uniqueValue: "Instant video recording and sharing for async work",
        moat: "Network effects, ease of use, video library lock-in",
        source: "curated",
        sourceUrl: "https://loom.com"
    },
    {
        name: "Airtable",
        tagline: "Build powerful work apps without coding",
        description: "Airtable is a low-code platform for building collaborative apps. Spreadsheet-database hybrid with powerful API. Used by 300k+ organizations for custom workflows and databases.",
        category: "Productivity",
        industry: "SaaS",
        targetMarket: JSON.stringify(["Global"]),
        stage: "mature",
        website: "https://airtable.com",
        upvotes: 13500,
        users: 300000,
        revenue: "$100M+",
        funding: "$1.4B",
        techStack: JSON.stringify(["react", "node.js", "postgresql", "redis"]),
        requiresML: false,
        requiresBlockchain: false,
        complexity: "high",
        revenueModel: "freemium",
        pricing: "$10-20/user/month",
        uniqueValue: "Spreadsheet-database hybrid with powerful API",
        moat: "Data lock-in, workflow automation, integrations",
        source: "curated",
        sourceUrl: "https://airtable.com"
    },
    {
        name: "Calendly",
        tagline: "Scheduling automation platform",
        description: "Calendly eliminates back-and-forth emails for finding meeting times. Share availability, let people pick a time. Used by 10M+ users including Fortune 500 companies.",
        category: "Productivity",
        industry: "SaaS",
        targetMarket: JSON.stringify(["Global"]),
        stage: "mature",
        website: "https://calendly.com",
        upvotes: 6500,
        users: 10000000,
        revenue: "$100M+",
        funding: "$350M",
        techStack: JSON.stringify(["ruby", "rails", "react", "postgresql"]),
        requiresML: false,
        requiresBlockchain: false,
        complexity: "medium",
        revenueModel: "freemium",
        pricing: "$8-16/user/month",
        uniqueValue: "Simple scheduling with calendar integration",
        moat: "Network effects, calendar integrations, user habits",
        source: "curated",
        sourceUrl: "https://calendly.com"
    },
    {
        name: "Zapier",
        tagline: "Automate work across 5,000+ apps",
        description: "Zapier connects apps and automates workflows. Create Zaps that move info between web apps automatically. No-code automation platform used by 5M+ users.",
        category: "Productivity",
        industry: "SaaS",
        targetMarket: JSON.stringify(["Global"]),
        stage: "mature",
        website: "https://zapier.com",
        upvotes: 10500,
        users: 5000000,
        revenue: "$140M+",
        funding: "$1.3B",
        techStack: JSON.stringify(["python", "django", "postgresql", "redis"]),
        requiresML: false,
        requiresBlockchain: false,
        complexity: "high",
        revenueModel: "freemium",
        pricing: "$20-50/month",
        uniqueValue: "5000+ app integrations with no-code automation",
        moat: "Integration network effects, workflow lock-in",
        source: "curated",
        sourceUrl: "https://zapier.com"
    }
];

async function seed() {
    const prisma = new PrismaClient();

    console.log('🚀 Starting database seeding...\n');

    let created = 0;
    let skipped = 0;

    try {
        for (const idea of startupIdeas) {
            try {
                const existing = await prisma.startupIdea.findFirst({
                    where: { name: idea.name }
                });

                if (existing) {
                    console.log(`⏭️  Skipped: ${idea.name} (already exists)`);
                    skipped++;
                    continue;
                }

                await prisma.startupIdea.create({ data: idea });
                console.log(`✅ Created: ${idea.name}`);
                created++;

            } catch (error) {
                console.error(`❌ Error with ${idea.name}:`, error.message);
            }
        }

        console.log(`\n✨ Seeding complete!`);
        console.log(`   Created: ${created}`);
        console.log(`   Skipped: ${skipped}`);
        console.log(`   Total: ${startupIdeas.length}`);

    } finally {
        await prisma.$disconnect();
    }
}

seed().catch(console.error);
