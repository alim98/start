const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const additionalStartups = [
    // --- Consumer Apps (Social, Media, Entertainment) ---
    {
        name: "Spotify",
        tagline: "Music for everyone",
        description: "Spotify is a digital music service that gives you access to millions of songs.",
        category: "Entertainment",
        industry: "Consumer",
        revenueModel: "freemium",
        upvotes: 25000,
        website: "https://spotify.com",
        stage: "public",
        funding: "Public",
        revenue: "$10B+",
        techStack: ["java", "python", "javascript"],
        complexity: "high"
    },
    {
        name: "Netflix",
        tagline: "See what's next",
        description: "Netflix is a streaming service that offers a wide variety of award-winning TV shows, movies, anime, documentaries, and more.",
        category: "Entertainment",
        industry: "Consumer",
        revenueModel: "subscription",
        upvotes: 30000,
        website: "https://netflix.com",
        stage: "public",
        funding: "Public",
        revenue: "$30B+",
        techStack: ["java", "javascript", "python", "aws"],
        complexity: "high"
    },
    {
        name: "YouTube",
        tagline: "Broadcast Yourself",
        description: "Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world.",
        category: "Entertainment",
        industry: "Consumer",
        revenueModel: "ads",
        upvotes: 50000,
        website: "https://youtube.com",
        stage: "public",
        funding: "Acquired",
        revenue: "$29B+",
        techStack: ["python", "c++", "java", "go"],
        complexity: "high"
    },
    {
        name: "TikTok",
        tagline: "Make Your Day",
        description: "TikTok is the leading destination for short-form mobile video.",
        category: "Social Media",
        industry: "Consumer",
        revenueModel: "ads",
        upvotes: 40000,
        website: "https://tiktok.com",
        stage: "unicorn",
        funding: "Private",
        revenue: "$10B+",
        techStack: ["c++", "python", "go"],
        complexity: "high"
    },
    {
        name: "Discord",
        tagline: "Your place to talk and hang out",
        description: "Discord is the easiest way to talk over voice, video, and text. Talk, chat, hang out, and stay close with your friends and communities.",
        category: "Social Media",
        industry: "Consumer",
        revenueModel: "freemium",
        upvotes: 22000,
        website: "https://discord.com",
        stage: "unicorn",
        funding: "$980M",
        revenue: "$500M+",
        techStack: ["elixir", "python", "rust", "react"],
        complexity: "high"
    },
    {
        name: "Twitch",
        tagline: "Interactive Livestreaming",
        description: "Twitch is an interactive livestreaming service for content spanning gaming, entertainment, sports, music, and more.",
        category: "Entertainment",
        industry: "Consumer",
        revenueModel: "freemium",
        upvotes: 18000,
        website: "https://twitch.tv",
        stage: "acquisition",
        funding: "Acquired",
        revenue: "$2B+",
        techStack: ["go", "ruby", "react"],
        complexity: "high"
    },

    // --- Marketplaces & Gig Economy ---
    {
        name: "Airbnb",
        tagline: "Belong anywhere",
        description: "Airbnb acts as a broker, mainly for vacation rentals and tourism activities.",
        category: "Travel",
        industry: "Marketplace",
        revenueModel: "marketplace",
        upvotes: 28000,
        website: "https://airbnb.com",
        stage: "public",
        funding: "Public",
        revenue: "$8B+",
        techStack: ["ruby", "java", "javascript"],
        complexity: "high"
    },
    {
        name: "Uber",
        tagline: "Get there",
        description: "Uber Technologies, Inc. provides ride-hailing services, food delivery, and freight transport.",
        category: "Transportation",
        industry: "Marketplace",
        revenueModel: "marketplace",
        upvotes: 35000,
        website: "https://uber.com",
        stage: "public",
        funding: "Public",
        revenue: "$30B+",
        techStack: ["go", "java", "python", "swift"],
        complexity: "high"
    },
    {
        name: "DoorDash",
        tagline: "Delivery & takeout from the best local restaurants",
        description: "DoorDash connects you with the best of your neighborhood.",
        category: "Food & Beverage",
        industry: "Marketplace",
        revenueModel: "marketplace",
        upvotes: 15000,
        website: "https://doordash.com",
        stage: "public",
        funding: "Public",
        revenue: "$6B+",
        techStack: ["kotlin", "swift", "python"],
        complexity: "high"
    },
    {
        name: "Upwork",
        tagline: "How work should work",
        description: "Upwork connects businesses with independent professionals and agencies around the globe.",
        category: "Productivity",
        industry: "Marketplace",
        revenueModel: "marketplace",
        upvotes: 12000,
        website: "https://upwork.com",
        stage: "public",
        funding: "Public",
        revenue: "$600M+",
        techStack: ["php", "java", "vue"],
        complexity: "high"
    },
    {
        name: "Fiverr",
        tagline: "Find the perfect freelance services for your business",
        description: "Fiverr connects businesses with freelancers offering digital services in 300+ categories.",
        category: "Productivity",
        industry: "Marketplace",
        revenueModel: "marketplace",
        upvotes: 11000,
        website: "https://fiverr.com",
        stage: "public",
        funding: "Public",
        revenue: "$300M+",
        techStack: ["ruby", "react", "go"],
        complexity: "high"
    },

    // --- Enterprise SaaS ---
    {
        name: "Salesforce",
        tagline: "We bring companies and customers together",
        description: "Salesforce is the world's #1 customer relationship management (CRM) platform.",
        category: "Sales",
        industry: "Enterprise",
        revenueModel: "subscription",
        upvotes: 20000,
        website: "https://salesforce.com",
        stage: "public",
        funding: "Public",
        revenue: "$30B+",
        techStack: ["java", "apex", "javascript"],
        complexity: "high"
    },
    {
        name: "HubSpot",
        tagline: "Grow better",
        description: "HubSpot offers a full platform of marketing, sales, customer service, and CRM software.",
        category: "Marketing",
        industry: "SaaS",
        revenueModel: "freemium",
        upvotes: 16000,
        website: "https://hubspot.com",
        stage: "public",
        funding: "Public",
        revenue: "$1.7B+",
        techStack: ["java", "javascript", "react"],
        complexity: "high"
    },
    {
        name: "Atlassian",
        tagline: "Unleash the potential of every team",
        description: "Atlassian develops products for software developers, project managers, and content management (Jira, Confluence).",
        category: "Productivity",
        industry: "Enterprise",
        revenueModel: "subscription",
        upvotes: 18000,
        website: "https://atlassian.com",
        stage: "public",
        funding: "Public",
        revenue: "$3B+",
        techStack: ["java", "react"],
        complexity: "high"
    },
    {
        name: "ServiceNow",
        tagline: "The world works with ServiceNow",
        description: "ServiceNow delivers digital workflows that create great experiences and unlock productivity.",
        category: "Productivity",
        industry: "Enterprise",
        revenueModel: "subscription",
        upvotes: 10000,
        website: "https://servicenow.com",
        stage: "public",
        funding: "Public",
        revenue: "$7B+",
        techStack: ["java", "javascript"],
        complexity: "high"
    },
    {
        name: "Zendesk",
        tagline: "Champions of customer service",
        description: "Zendesk builds software for better customer relationships.",
        category: "Support",
        industry: "SaaS",
        revenueModel: "subscription",
        upvotes: 9500,
        website: "https://zendesk.com",
        stage: "public",
        funding: "Acquired",
        revenue: "$1.3B+",
        techStack: ["ruby", "react", "ember"],
        complexity: "high"
    },

    // --- AI & Future Tech ---
    {
        name: "Anthropic",
        tagline: "AI research and deployment",
        description: "Anthropic is an AI safety and research company that's working to build reliable, interpretable, and steerable AI systems (Claude).",
        category: "AI/ML",
        industry: "Research",
        revenueModel: "usage",
        upvotes: 12000,
        website: "https://anthropic.com",
        stage: "unicorn",
        funding: "$7B+",
        revenue: "$100M+",
        techStack: ["python", "rust", "pytorch"],
        complexity: "high"
    },
    {
        name: "Perplexity AI",
        tagline: "Where knowledge begins",
        description: "Perplexity AI unlocks the power of knowledge with information discovery and sharing.",
        category: "AI/ML",
        industry: "Search",
        revenueModel: "usage",
        upvotes: 9000,
        website: "https://perplexity.ai",
        stage: "growing",
        funding: "$100M+",
        revenue: "Unknown",
        techStack: ["python", "next.js", "react"],
        complexity: "high"
    },
    {
        name: "Hugging Face",
        tagline: "The AI community building the future",
        description: "Hugging Face is the home of Machine Learning, where you can create, discover, and collaborate on ML models, datasets, and demos.",
        category: "AI/ML",
        industry: "Developer Tools",
        revenueModel: "freemium",
        upvotes: 14000,
        website: "https://huggingface.co",
        stage: "unicorn",
        funding: "$396M",
        revenue: "$30M+",
        techStack: ["python", "javascript", "rust"],
        complexity: "high"
    },
    {
        name: "Runway",
        tagline: "Make impossible video",
        description: "Runway is a next-generation creative suite that has everything you need to make content, fast.",
        category: "AI/ML",
        industry: "Creative",
        revenueModel: "subscription",
        upvotes: 8500,
        website: "https://runwayml.com",
        stage: "growing",
        funding: "$236M",
        revenue: "$10M+",
        techStack: ["python", "c++", "webgl"],
        complexity: "high"
    },

    // --- Cloud & Infrastructure ---
    {
        name: "Vercel",
        tagline: "Develop. Preview. Ship.",
        description: "Vercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration.",
        category: "Developer Tools",
        industry: "Infrastructure",
        revenueModel: "freemium",
        upvotes: 15500,
        website: "https://vercel.com",
        stage: "unicorn",
        funding: "$560M",
        revenue: "$100M+",
        techStack: ["next.js", "go", "rust"],
        complexity: "high"
    },
    {
        name: "Heroku",
        tagline: "Platform as a Service",
        description: "Heroku is a platform as a service (PaaS) that enables developers to build, run, and operate applications entirely in the cloud.",
        category: "Developer Tools",
        industry: "Infrastructure",
        revenueModel: "freemium",
        upvotes: 12000,
        website: "https://heroku.com",
        stage: "acquisition",
        funding: "Acquired",
        revenue: "$300M+",
        techStack: ["ruby", "erlang", "go"],
        complexity: "high"
    },
    {
        name: "DigitalOcean",
        tagline: "The cloud for developers",
        description: "DigitalOcean simplifies cloud computing so developers and businesses can spend more time building software that changes the world.",
        category: "Developer Tools",
        industry: "Infrastructure",
        revenueModel: "usage",
        upvotes: 11000,
        website: "https://digitalocean.com",
        stage: "public",
        funding: "Public",
        revenue: "$500M+",
        techStack: ["go", "ruby", "perl"],
        complexity: "high"
    },

    // --- Productivity & Utilities ---
    {
        name: "Evernote",
        tagline: "Tame your work, organize your life",
        description: "Evernote gives you everything you need to keep life organized—great note taking, project planning, and easy ways to find what you need.",
        category: "Productivity",
        industry: "SaaS",
        revenueModel: "freemium",
        upvotes: 13000,
        website: "https://evernote.com",
        stage: "acquisition",
        funding: "Acquired",
        revenue: "$100M+",
        techStack: ["java", "c++", "electron"],
        complexity: "medium"
    },
    {
        name: "Grammarly",
        tagline: "Great writing, simplified",
        description: "Grammarly's AI-powered writing assistant helps you write mistake-free content.",
        category: "Productivity",
        industry: "SaaS",
        revenueModel: "freemium",
        upvotes: 16500,
        website: "https://grammarly.com",
        stage: "unicorn",
        funding: "$400M",
        revenue: "$100M+",
        techStack: ["lisp", "python", "javascript"],
        complexity: "high"
    },
    {
        name: "Dropbox",
        tagline: "Focus on the work that matters",
        description: "Dropbox is a modern workspace designed to reduce busywork-so you can focus on the things that matter.",
        category: "Productivity",
        industry: "SaaS",
        revenueModel: "freemium",
        upvotes: 14000,
        website: "https://dropbox.com",
        stage: "public",
        funding: "Public",
        revenue: "$2B+",
        techStack: ["python", "go", "rust"],
        complexity: "high"
    },

    // --- E-commerce & Logistics ---
    {
        name: "Flexport",
        tagline: "The platform for global trade",
        description: "Flexport is the modern freight forwarder. We use technology to make it easier for companies to move products around the world.",
        category: "Logistics",
        industry: "Tech-Enabled Services",
        revenueModel: "service",
        upvotes: 6000,
        website: "https://flexport.com",
        stage: "unicorn",
        funding: "$2.3B",
        revenue: "$3B+",
        techStack: ["java", "ruby", "javascript"],
        complexity: "high"
    },
    {
        name: "Instacart",
        tagline: "Order groceries together",
        description: "Instacart is a grocery delivery service that delivers in as little as an hour.",
        category: "Food & Beverage",
        industry: "Marketplace",
        revenueModel: "marketplace",
        upvotes: 11000,
        website: "https://instacart.com",
        stage: "public",
        funding: "Public",
        revenue: "$2.5B+",
        techStack: ["python", "ruby", "swift"],
        complexity: "high"
    },

    // --- Education & EdTech ---
    {
        name: "Khan Academy",
        tagline: "For every student, every classroom",
        description: "Khan Academy offers practice exercises, instructional videos, and a personalized learning dashboard that empower learners to study at their own pace.",
        category: "Education",
        industry: "Non-profit",
        revenueModel: "donation",
        upvotes: 13000,
        website: "https://khanacademy.org",
        stage: "mature",
        funding: "Donations",
        revenue: "$50M+",
        techStack: ["python", "javascript", "react"],
        complexity: "medium"
    },
    {
        name: "MasterClass",
        tagline: "Learn from the best",
        description: "MasterClass offers online classes created for students of all skill levels. Our instructors are the best in the world.",
        category: "Education",
        industry: "Consumer",
        revenueModel: "subscription",
        upvotes: 9500,
        website: "https://masterclass.com",
        stage: "unicorn",
        funding: "$461M",
        revenue: "$100M+",
        techStack: ["react", "node.js"],
        complexity: "medium"
    }
];

async function seed() {
    console.log(`🌱 Seeding database with ${additionalStartups.length} MORE curated startups...`);

    let newCount = 0;

    for (const startup of additionalStartups) {
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
                    source: 'curated-batch-2',
                    sourceUrl: startup.website,
                    sourceId: `curated-${startup.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                    requiresML: startup.techStack.join(' ').includes('python') || startup.category === 'AI/ML',
                    requiresBlockchain: startup.name === 'Coinbase'
                }
            });

            console.log(`✅ Created: ${startup.name}`);
            newCount++;
        } catch (error) {
            console.error(`❌ Error creating ${startup.name}:`, error.message);
        }
    }

    console.log(`✨ Added ${newCount} new startups!`);
}

seed()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
