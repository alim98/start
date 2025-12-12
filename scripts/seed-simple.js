const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ideas = [
  { name: "Notion", tagline: "All-in-one workspace", description: "Collaboration platform with notes, tasks, wikis, and databases", category: "Productivity", industry: "SaaS", targetMarket: '["Global"]', stage: "mature", website: "https://notion.so", upvotes: 15000, techStack: '["react","typescript"]', requiresML: false, requiresBlockchain: false, complexity: "high", revenueModel: "freemium", source: "manual", sourceUrl: "https://notion.so" },
  { name: "Stripe", tagline: "Payment infrastructure", description: "Payment processing for internet businesses", category: "Fintech", industry: "Fintech", targetMarket: '["Global"]', stage: "mature", website: "https://stripe.com", upvotes: 12000, techStack: '["ruby","javascript"]', requiresML: true, requiresBlockchain: false, complexity: "high", revenueModel: "transaction", source: "manual", sourceUrl: "https://stripe.com" },
  { name: "Figma", tagline: "Collaborative design tool", description: "Web-based interface design with real-time collaboration", category: "Design", industry: "SaaS", targetMarket: '["Global"]', stage: "mature", website: "https://figma.com", upvotes: 18000, techStack: '["typescript","react"]', requiresML: false, requiresBlockchain: false, complexity: "high", revenueModel: "freemium", source: "manual", sourceUrl: "https://figma.com" },
  { name: "Vercel", tagline: "Frontend platform", description: "Deploy frontend apps with automatic scaling and global CDN", category: "Developer Tools", industry: "SaaS", targetMarket: '["Global"]', stage: "growing", website: "https://vercel.com", upvotes: 8500, techStack: '["next.js","react"]', requiresML: false, requiresBlockchain: false, complexity: "high", revenueModel: "freemium", source: "manual", sourceUrl: "https://vercel.com" },
  { name: "Linear", tagline: "Issue tracking", description: "Fast issue tracker for software teams with keyboard shortcuts", category: "Productivity", industry: "SaaS", targetMarket: '["Global"]', stage: "growing", website: "https://linear.app", upvotes: 9200, techStack: '["typescript","graphql"]', requiresML: false, requiresBlockchain: false, complexity: "medium", revenueModel: "subscription", source: "manual", sourceUrl: "https://linear.app" },
  { name: "Superhuman", tagline: "Fastest email client", description: "Premium email with AI-powered features and keyboard shortcuts", category: "Productivity", industry: "SaaS", targetMarket: '["North America"]', stage: "growing", website: "https://superhuman.com", upvotes: 7800, techStack: '["react","node.js"]', requiresML: true, requiresBlockchain: false, complexity: "medium", revenueModel: "subscription", source: "manual", sourceUrl: "https://superhuman.com" },
  { name: "Loom", tagline: "Video messaging", description: "Instant video recording and sharing for async communication", category: "Productivity", industry: "SaaS", targetMarket: '["Global"]', stage: "mature", website: "https://loom.com", upvotes: 11000, techStack: '["react","webrtc"]', requiresML: true, requiresBlockchain: false, complexity: "high", revenueModel: "freemium", source: "manual", sourceUrl: "https://loom.com" },
  { name: "Airtable", tagline: "No-code database", description: "Spreadsheet-database hybrid for building collaborative apps", category: "Productivity", industry: "SaaS", targetMarket: '["Global"]', stage: "mature", website: "https://airtable.com", upvotes: 13500, techStack: '["react","postgresql"]', requiresML: false, requiresBlockchain: false, complexity: "high", revenueModel: "freemium", source: "manual", sourceUrl: "https://airtable.com" },
  { name: "Calendly", tagline: "Scheduling automation", description: "Eliminate back-and-forth emails for finding meeting times", category: "Productivity", industry: "SaaS", targetMarket: '["Global"]', stage: "mature", website: "https://calendly.com", upvotes: 6500, techStack: '["ruby","react"]', requiresML: false, requiresBlockchain: false, complexity: "medium", revenueModel: "freemium", source: "manual", sourceUrl: "https://calendly.com" },
  { name: "Zapier", tagline: "Workflow automation", description: "Connect 5000+ apps with no-code automation workflows", category: "Productivity", industry: "SaaS", targetMarket: '["Global"]', stage: "mature", website: "https://zapier.com", upvotes: 10500, techStack: '["python","django"]', requiresML: false, requiresBlockchain: false, complexity: "high", revenueModel: "freemium", source: "manual", sourceUrl: "https://zapier.com" }
];

async function main() {
  console.log('Seeding database...');
  let count = 0;
  for (const idea of ideas) {
    const existing = await prisma.startupIdea.findFirst({ where: { name: idea.name } });
    if (!existing) {
      await prisma.startupIdea.create({ data: idea });
      console.log('Created:', idea.name);
      count++;
    }
  }
  console.log('Done! Created', count, 'ideas');
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
