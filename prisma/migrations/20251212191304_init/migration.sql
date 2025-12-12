-- CreateTable
CREATE TABLE "StartupIdea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "targetMarket" TEXT NOT NULL,
    "marketSize" TEXT,
    "competitorCount" INTEGER,
    "stage" TEXT NOT NULL,
    "launchDate" DATETIME,
    "website" TEXT,
    "upvotes" INTEGER,
    "users" INTEGER,
    "revenue" TEXT,
    "funding" TEXT,
    "techStack" TEXT NOT NULL,
    "requiresML" BOOLEAN NOT NULL DEFAULT false,
    "requiresBlockchain" BOOLEAN NOT NULL DEFAULT false,
    "complexity" TEXT NOT NULL,
    "revenueModel" TEXT NOT NULL,
    "pricing" TEXT,
    "uniqueValue" TEXT,
    "moat" TEXT,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceId" TEXT,
    "scrapedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "StartupIdea_category_idx" ON "StartupIdea"("category");

-- CreateIndex
CREATE INDEX "StartupIdea_industry_idx" ON "StartupIdea"("industry");

-- CreateIndex
CREATE INDEX "StartupIdea_source_idx" ON "StartupIdea"("source");

-- CreateIndex
CREATE INDEX "StartupIdea_stage_idx" ON "StartupIdea"("stage");
