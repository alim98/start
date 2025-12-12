import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ProductHuntProduct {
    id: string;
    name: string;
    tagline: string;
    description: string;
    url: string;
    votesCount: number;
    commentsCount: number;
    createdAt: string;
    website?: string;
    topics: { name: string }[];
    makers: { name: string }[];
}

/**
 * Product Hunt Scraper
 * Uses the official Product Hunt GraphQL API
 * API Key required: https://www.producthunt.com/v2/oauth/applications
 */
export class ProductHuntScraper {
    private apiKey: string;
    private apiUrl = 'https://api.producthunt.com/v2/api/graphql';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Fetch products from Product Hunt
     */
    async fetchProducts(limit: number = 100): Promise<ProductHuntProduct[]> {
        const query = `
      query GetPosts($first: Int!) {
        posts(first: $first, order: VOTES) {
          edges {
            node {
              id
              name
              tagline
              description
              url
              votesCount
              commentsCount
              createdAt
              website
              topics {
                edges {
                  node {
                    name
                  }
                }
              }
              makers {
                edges {
                  node {
                    name
                  }
                }
              }
            }
          }
        }
      }
    `;

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    query,
                    variables: { first: limit },
                }),
            });

            if (!response.ok) {
                throw new Error(`Product Hunt API error: ${response.statusText}`);
            }

            const data = await response.json();

            return data.data.posts.edges.map((edge: any) => ({
                id: edge.node.id,
                name: edge.node.name,
                tagline: edge.node.tagline,
                description: edge.node.description,
                url: edge.node.url,
                votesCount: edge.node.votesCount,
                commentsCount: edge.node.commentsCount,
                createdAt: edge.node.createdAt,
                website: edge.node.website,
                topics: edge.node.topics.edges.map((t: any) => ({ name: t.node.name })),
                makers: edge.node.makers.edges.map((m: any) => ({ name: m.node.name })),
            }));
        } catch (error) {
            console.error('Error fetching from Product Hunt:', error);
            throw error;
        }
    }

    /**
     * Extract tech stack from description using patterns
     */
    private extractTechStack(description: string): string[] {
        const techKeywords = [
            'react', 'vue', 'angular', 'next.js', 'node.js', 'python', 'django',
            'flask', 'ruby', 'rails', 'php', 'laravel', 'java', 'spring',
            'typescript', 'javascript', 'go', 'rust', 'swift', 'kotlin',
            'postgresql', 'mysql', 'mongodb', 'redis', 'aws', 'gcp', 'azure',
            'docker', 'kubernetes', 'graphql', 'rest api', 'websocket'
        ];

        const found: string[] = [];
        const lowerDesc = description.toLowerCase();

        for (const tech of techKeywords) {
            if (lowerDesc.includes(tech)) {
                found.push(tech);
            }
        }

        return found;
    }

    /**
     * Determine category from topics
     */
    private determineCategory(topics: { name: string }[]): string {
        const topicNames = topics.map(t => t.name.toLowerCase());

        if (topicNames.some(t => t.includes('saas') || t.includes('software'))) return 'SaaS';
        if (topicNames.some(t => t.includes('ai') || t.includes('machine learning'))) return 'AI/ML';
        if (topicNames.some(t => t.includes('productivity'))) return 'Productivity';
        if (topicNames.some(t => t.includes('developer'))) return 'Developer Tools';
        if (topicNames.some(t => t.includes('design'))) return 'Design';
        if (topicNames.some(t => t.includes('marketing'))) return 'Marketing';
        if (topicNames.some(t => t.includes('finance') || t.includes('fintech'))) return 'Fintech';
        if (topicNames.some(t => t.includes('health'))) return 'Healthcare';
        if (topicNames.some(t => t.includes('education'))) return 'Education';

        return 'Technology';
    }

    /**
     * Determine industry from category and description
     */
    private determineIndustry(category: string, description: string): string {
        const lowerDesc = description.toLowerCase();

        if (lowerDesc.includes('b2b') || lowerDesc.includes('enterprise')) return 'Enterprise';
        if (lowerDesc.includes('consumer') || lowerDesc.includes('b2c')) return 'Consumer';
        if (category === 'SaaS') return 'SaaS';
        if (category === 'AI/ML') return 'Technology';
        if (category === 'Fintech') return 'Fintech';
        if (category === 'Healthcare') return 'Healthcare';
        if (category === 'Education') return 'Education';

        return 'Technology';
    }

    /**
     * Determine revenue model from description
     */
    private determineRevenueModel(description: string): string {
        const lowerDesc = description.toLowerCase();

        if (lowerDesc.includes('subscription') || lowerDesc.includes('monthly') || lowerDesc.includes('saas')) {
            return 'subscription';
        }
        if (lowerDesc.includes('freemium') || lowerDesc.includes('free tier')) {
            return 'freemium';
        }
        if (lowerDesc.includes('marketplace') || lowerDesc.includes('commission')) {
            return 'marketplace';
        }
        if (lowerDesc.includes('transaction') || lowerDesc.includes('per-use')) {
            return 'transaction';
        }
        if (lowerDesc.includes('ads') || lowerDesc.includes('advertising')) {
            return 'advertising';
        }

        return 'subscription'; // default for most SaaS
    }

    /**
     * Determine complexity from description
     */
    private determineComplexity(description: string, techStack: string[]): string {
        const lowerDesc = description.toLowerCase();

        // High complexity indicators
        if (lowerDesc.includes('ai') || lowerDesc.includes('machine learning') ||
            lowerDesc.includes('blockchain') || lowerDesc.includes('real-time') ||
            techStack.length > 5) {
            return 'high';
        }

        // Low complexity indicators
        if (lowerDesc.includes('simple') || lowerDesc.includes('lightweight') ||
            techStack.length <= 2) {
            return 'low';
        }

        return 'medium';
    }

    /**
     * Save product to database
     */
    async saveToDatabase(product: ProductHuntProduct): Promise<void> {
        const techStack = this.extractTechStack(product.description);
        const category = this.determineCategory(product.topics);
        const industry = this.determineIndustry(category, product.description);
        const revenueModel = this.determineRevenueModel(product.description);
        const complexity = this.determineComplexity(product.description, techStack);

        await prisma.startupIdea.create({
            data: {
                name: product.name,
                tagline: product.tagline,
                description: product.description,
                category,
                industry,
                targetMarket: JSON.stringify(['Global']), // Default to global
                stage: 'launched', // Product Hunt products are launched
                launchDate: new Date(product.createdAt),
                website: product.website || product.url,
                upvotes: product.votesCount,
                techStack: JSON.stringify(techStack),
                requiresML: product.description.toLowerCase().includes('ai') ||
                    product.description.toLowerCase().includes('machine learning'),
                requiresBlockchain: product.description.toLowerCase().includes('blockchain') ||
                    product.description.toLowerCase().includes('web3'),
                complexity,
                revenueModel,
                source: 'producthunt',
                sourceUrl: product.url,
                sourceId: product.id,
            },
        });

        console.log(`✅ Saved: ${product.name}`);
    }

    /**
     * Run the scraper
     */
    async scrape(limit: number = 100): Promise<void> {
        console.log(`🚀 Starting Product Hunt scraper (limit: ${limit})...`);

        try {
            const products = await this.fetchProducts(limit);
            console.log(`📦 Fetched ${products.length} products`);

            let saved = 0;
            let skipped = 0;

            for (const product of products) {
                try {
                    // Check if already exists
                    const existing = await prisma.startupIdea.findFirst({
                        where: { sourceId: product.id, source: 'producthunt' },
                    });

                    if (existing) {
                        console.log(`⏭️  Skipped (exists): ${product.name}`);
                        skipped++;
                        continue;
                    }

                    await this.saveToDatabase(product);
                    saved++;

                    // Rate limiting: wait 100ms between saves
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error) {
                    console.error(`❌ Error saving ${product.name}:`, error);
                }
            }

            console.log(`\n✨ Scraping complete!`);
            console.log(`   Saved: ${saved}`);
            console.log(`   Skipped: ${skipped}`);
            console.log(`   Total: ${products.length}`);
        } catch (error) {
            console.error('❌ Scraping failed:', error);
            throw error;
        } finally {
            await prisma.$disconnect();
        }
    }
}

// CLI usage
if (require.main === module) {
    const apiKey = process.env.PRODUCT_HUNT_API_KEY;

    if (!apiKey) {
        console.error('❌ PRODUCT_HUNT_API_KEY environment variable is required');
        console.error('   Get your API key from: https://www.producthunt.com/v2/oauth/applications');
        process.exit(1);
    }

    const limit = parseInt(process.argv[2] || '100');
    const scraper = new ProductHuntScraper(apiKey);

    scraper.scrape(limit)
        .then(() => {
            console.log('✅ Done!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Failed:', error);
            process.exit(1);
        });
}
