const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const curatedStartups = [
    // Productivity & Collaboration
    {
        name: "Slack",
        tagline: "Be less busy",
        description: "Slack is a messaging app for business that connects people to the information they need. By bringing people together to work as one unified team, Slack transforms the way organizations communicate.",
        category: "Productivity",
        industry: "SaaS",
        revenueModel: "subscription",
        upvotes: 20000,
        website: "https://slack.com",
        stage: "public",
        funding: "Public",
        revenue: "$1B+",
        techStack: ["electron", "react", "php", "java"],
        complexity: "high"
    },
    {
        name: "Trello",
        tagline: "Organize anything, together",
        description: "Trello is a collaboration tool that organizes your projects into boards. In one glance, Trello tells you what's being worked on, who's working on what, and where something is in a process.",
        category: "Productivity",
        industry: "SaaS",
        revenueModel: "freemium",
        upvotes: 18000,
        website: "https://trello.com",
        stage: "acquisition",
        funding: "Acquired",
        revenue: "$50M+",
        techStack: ["backbone.js", "node.js", "mongodb"],
        complexity: "medium"
    },
    {
        name: "Asana",
        tagline: "The easiest way to manage team projects and tasks",
        description: "Asana helps teams orchestrate their work, from small projects to strategic initiatives. Headquartered in San Francisco, CA, Asana has more than 114,000 paying customers and millions of free organizations across 190 countries.",
        category: "Productivity",
        industry: "SaaS",
        revenueModel: "subscription",
        upvotes: 12000,
        website: "https://asana.com",
        stage: "public",
        funding: "Public",
        revenue: "$500M+",
        techStack: ["react", "typescript", "node.js", "scala"],
        complexity: "high"
    },
    {
        name: "Zoom",
        tagline: "Video conferencing, cloud phone, webinars, chat",
        description: "Zoom is the leader in modern enterprise video communications, with an easy, reliable cloud platform for video and audio conferencing, chat, and webinars.",
        category: "Productivity",
        industry: "Enterprise",
        revenueModel: "freemium",
        upvotes: 8000,
        website: "https://zoom.us",
        stage: "public",
        funding: "Public",
        revenue: "$4B+",
        techStack: ["webassembly", "vue", "java"],
        complexity: "high"
    },
    {
        name: "Miro",
        tagline: "The online whiteboarding platform",
        description: "Miro is the online collaborative whiteboarding platform that enables distributed teams to work effectively together, from brainstorming with digital sticky notes to planning and managing agile workflows.",
        category: "Design",
        industry: "SaaS",
        revenueModel: "freemium",
        upvotes: 14000,
        website: "https://miro.com",
        stage: "growing",
        funding: "$476M",
        revenue: "$100M+",
        techStack: ["canvas", "react", "java"],
        complexity: "high"
    },

    // Fintech
    {
        name: "Robinhood",
        tagline: "Investing for everyone",
        description: "Robinhood is on a mission to democratize finance for all. They offer commission-free trading in one user-friendly platform.",
        category: "Fintech",
        industry: "Consumer",
        revenueModel: "transaction",
        upvotes: 15500,
        website: "https://robinhood.com",
        stage: "public",
        funding: "Public",
        revenue: "$1B+",
        techStack: ["python", "django", "swift", "kotlin"],
        complexity: "high"
    },
    {
        name: "Revolut",
        tagline: "One app for all things money",
        description: "Revolut is building a borderless global bank to help people manage their money better.",
        category: "Fintech",
        industry: "Consumer",
        revenueModel: "freemium",
        upvotes: 11000,
        website: "https://revolut.com",
        stage: "growing",
        funding: "$1.7B",
        revenue: "$100M+",
        techStack: ["java", "kotlin", "swift"],
        complexity: "high"
    },
    {
        name: "Plaid",
        tagline: "The technology layer for financial services",
        description: "Plaid provides the tools and access needed for the development of a digitally-enabled financial system.",
        category: "Fintech",
        industry: "Infrastructure",
        revenueModel: "transaction",
        upvotes: 9500,
        website: "https://plaid.com",
        stage: "growing",
        funding: "$734M",
        revenue: "$100M+",
        techStack: ["go", "python", "typescript"],
        complexity: "high"
    },
    {
        name: "Wise",
        tagline: "The cheap, fast way to send money abroad",
        description: "Wise (formerly TransferWise) is a money transfer service allowing private individuals and businesses to send money abroad without hidden charges.",
        category: "Fintech",
        industry: "Consumer",
        revenueModel: "transaction",
        upvotes: 13000,
        website: "https://wise.com",
        stage: "public",
        funding: "Public",
        revenue: "$500M+",
        techStack: ["java", "spring", "angular"],
        complexity: "high"
    },
    {
        name: "Coinbase",
        tagline: "Buy and sell cryptocurrency",
        description: "Coinbase is a secure online platform for buying, selling, transferring, and storing digital currency.",
        category: "Fintech",
        industry: "Consumer",
        revenueModel: "transaction",
        upvotes: 16000,
        website: "https://coinbase.com",
        stage: "public",
        funding: "Public",
        revenue: "$3B+",
        techStack: ["ruby", "rails", "react", "react native"],
        complexity: "high"
    },

    // E-commerce
    {
        name: "Shopify",
        tagline: "The all-in-one commerce platform",
        description: "Shopify is a complete commerce platform that lets you start, grow, and manage a business.",
        category: "E-commerce",
        industry: "SaaS",
        revenueModel: "subscription",
        upvotes: 19000,
        website: "https://shopify.com",
        stage: "public",
        funding: "Public",
        revenue: "$4B+",
        techStack: ["ruby", "rails", "go", "react"],
        complexity: "high"
    },
    {
        name: "Webflow",
        tagline: "The modern way to build for the web",
        description: "Webflow empowers designers to build professional, custom websites in a completely visual canvas with no code.",
        category: "Design",
        industry: "SaaS",
        revenueModel: "subscription",
        upvotes: 17500,
        website: "https://webflow.com",
        stage: "growing",
        funding: "$335M",
        revenue: "$100M+",
        techStack: ["react", "node.js"],
        complexity: "high"
    },
    {
        name: "Faire",
        tagline: "The online wholesale marketplace",
        description: "Faire is an online wholesale marketplace that connects independent retailers and brands.",
        category: "E-commerce",
        industry: "Marketplace",
        revenueModel: "marketplace",
        upvotes: 7000,
        website: "https://faire.com",
        stage: "growing",
        funding: "$1B+",
        revenue: "$1B+",
        techStack: ["python", "typescript", "react"],
        complexity: "high"
    },
    {
        name: "Gumroad",
        tagline: "Super-simple e-commerce for creators",
        description: "Gumroad helps creators sell products directly to their audience.",
        category: "E-commerce",
        industry: "Creator Economy",
        revenueModel: "transaction",
        upvotes: 12500,
        website: "https://gumroad.com",
        stage: "mature",
        funding: "$8M",
        revenue: "$20M+",
        techStack: ["ruby", "rails", "react"],
        complexity: "medium"
    },

    // Developer Tools
    {
        name: "GitLab",
        tagline: "The One DevOps Platform",
        description: "GitLab is a complete DevOps platform, delivered as a single application, fundamentally changing the way Development, Security, and Ops teams collaborate.",
        category: "Developer Tools",
        industry: "Enterprise",
        revenueModel: "subscription",
        upvotes: 13000,
        website: "https://gitlab.com",
        stage: "public",
        funding: "Public",
        revenue: "$400M+",
        techStack: ["ruby", "rails", "vue", "go"],
        complexity: "high"
    },
    {
        name: "Postman",
        tagline: "The collaboration platform for API development",
        description: "Postman makes it easy for developers to create, share, test and document APIs.",
        category: "Developer Tools",
        industry: "SaaS",
        revenueModel: "freemium",
        upvotes: 11500,
        website: "https://postman.com",
        stage: "growing",
        funding: "$433M",
        revenue: "$100M+",
        techStack: ["electron", "react", "node.js"],
        complexity: "medium"
    },
    {
        name: "Docker",
        tagline: "Empowering App Development for Developers",
        description: "Docker removes the friction of 'dependency hell' to make building and deploying software easy.",
        category: "Developer Tools",
        industry: "Infrastructure",
        revenueModel: "freemium",
        upvotes: 14000,
        website: "https://docker.com",
        stage: "mature",
        funding: "$435M",
        revenue: "$100M+",
        techStack: ["go", "react"],
        complexity: "high"
    },
    {
        name: "HashiCorp",
        tagline: "Cloud Infrastructure Automation",
        description: "HashiCorp provides open source tools and commercial products to enable developers and operators to provision, secure, run, and connect cloud-computing infrastructure.",
        category: "Developer Tools",
        industry: "Infrastructure",
        revenueModel: "freemium",
        upvotes: 8500,
        website: "https://hashicorp.com",
        stage: "public",
        funding: "Public",
        revenue: "$300M+",
        techStack: ["go", "ember"],
        complexity: "high"
    },

    // Health & Wellness
    {
        name: "Calm",
        tagline: "Sleep more. Stress less. Live better.",
        description: "Calm is the #1 app for sleep, meditation and relaxation.",
        category: "Healthcare",
        industry: "Wellness",
        revenueModel: "subscription",
        upvotes: 9000,
        website: "https://calm.com",
        stage: "unicorn",
        funding: "$218M",
        revenue: "$150M+",
        techStack: ["react native", "node.js"],
        complexity: "medium"
    },
    {
        name: "Headspace",
        tagline: "Meditation and sleep made simple",
        description: "Headspace is your guide to health and happiness. It’s the simple way to let go of stress and get a better night’s rest.",
        category: "Healthcare",
        industry: "Wellness",
        revenueModel: "subscription",
        upvotes: 8800,
        website: "https://headspace.com",
        stage: "unicorn",
        funding: "$215M",
        revenue: "$100M+",
        techStack: ["swift", "kotlin", "node.js"],
        complexity: "medium"
    },
    {
        name: "Oura",
        tagline: "Accurate health information, straight from your body",
        description: "Oura Ring tracks your sleep, activity, and recovery to give you a complete picture of your health.",
        category: "Healthcare",
        industry: "Hardware",
        revenueModel: "subscription",
        upvotes: 6000,
        website: "https://ouraring.com",
        stage: "growing",
        funding: "$148M",
        revenue: "$100M+",
        techStack: ["c++", "swift", "kotlin"],
        complexity: "high"
    },

    // AI/ML
    {
        name: "OpenAI",
        tagline: "Creating safe AGI that benefits all of humanity",
        description: "OpenAI is an AI research and deployment company. Our mission is to ensure that artificial general intelligence benefits all of humanity.",
        category: "AI/ML",
        industry: "Research",
        revenueModel: "usage",
        upvotes: 25000,
        website: "https://openai.com",
        stage: "unicorn",
        funding: "$11B+",
        revenue: "$1B+",
        techStack: ["python", "pytorch", "react"],
        complexity: "high"
    },
    {
        name: "Jasper",
        tagline: "Create amazing content faster",
        description: "Jasper is the AI Content Generator that helps you and your team break through creative blocks to create amazing, original content 10X faster.",
        category: "AI/ML",
        industry: "Marketing",
        revenueModel: "subscription",
        upvotes: 11000,
        website: "https://jasper.ai",
        stage: "unicorn",
        funding: "$131M",
        revenue: "$80M+",
        techStack: ["gpt-3", "react", "node.js"],
        complexity: "high"
    },
    {
        name: "Midjourney",
        tagline: "Expand your imagination",
        description: "Midjourney is an independent research lab exploring new mediums of thought and expanding the imaginative powers of the human species.",
        category: "AI/ML",
        industry: "Design",
        revenueModel: "subscription",
        upvotes: 13000,
        website: "https://midjourney.com",
        stage: "bootstrap",
        funding: "Bootstrapped",
        revenue: "$200M+",
        techStack: ["discord", "pytorch"],
        complexity: "high"
    },

    // Education
    {
        name: "Duolingo",
        tagline: "The world's best way to learn a language",
        description: "Duolingo is the fun, free app for learning 40+ languages through quick, bite-sized lessons.",
        category: "Education",
        industry: "Consumer",
        revenueModel: "freemium",
        upvotes: 16000,
        website: "https://duolingo.com",
        stage: "public",
        funding: "Public",
        revenue: "$300M+",
        techStack: ["scala", "react", "swift", "kotlin"],
        complexity: "medium"
    },
    {
        name: "Udemy",
        tagline: "Share your knowledge with millions of students",
        description: "Udemy is an online learning and teaching marketplace with over 213000 courses and 62 million students.",
        category: "Education",
        industry: "Marketplace",
        revenueModel: "transaction",
        upvotes: 10000,
        website: "https://udemy.com",
        stage: "public",
        funding: "Public",
        revenue: "$600M+",
        techStack: ["python", "django", "angular"],
        complexity: "medium"
    },
    {
        name: "Coursera",
        tagline: "Build skills with courses, certificates, and degrees",
        description: "Coursera partners with more than 275 leading universities and companies to bring flexible, affordable, job-relevant online learning to individuals and organizations worldwide.",
        category: "Education",
        industry: "Marketplace",
        revenueModel: "subscription",
        upvotes: 12000,
        website: "https://coursera.org",
        stage: "public",
        funding: "Public",
        revenue: "$500M+",
        techStack: ["scala", "react", "graphql"],
        complexity: "high"
    }
];

async function seed() {
    console.log(`🌱 Seeding database with ${curatedStartups.length} curated startups...`);

    for (const startup of curatedStartups) {
        try {
            // Check if exists
            const existing = await prisma.startupIdea.findFirst({
                where: { name: startup.name }
            });

            if (existing) {
                console.log(`⏩ Skipped (exists): ${startup.name}`);
                continue;
            }

            await prisma.startupIdea.create({
                data: {
                    name: startup.name,
                    tagline: startup.tagline,
                    description: startup.description,
                    category: startup.category,
                    industry: startup.industry,
                    targetMarket: JSON.stringify(['Global']),
                    stage: startup.stage,
                    website: startup.website,
                    upvotes: startup.upvotes,
                    revenue: startup.revenue,
                    funding: startup.funding,
                    techStack: JSON.stringify(startup.techStack),
                    complexity: startup.complexity,
                    revenueModel: startup.revenueModel,
                    source: 'curated',
                    sourceUrl: startup.website,
                    sourceId: `curated-${startup.name.toLowerCase().replace(/\s+/g, '-')}`,
                    requiresML: startup.category === 'AI/ML' || startup.techStack.includes('python'),
                    requiresBlockchain: startup.category === 'Web3'
                }
            });

            console.log(`✅ Created: ${startup.name}`);
        } catch (error) {
            console.error(`❌ Error creating ${startup.name}:`, error);
        }
    }

    console.log('✨ Seeding complete!');
}

seed()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
