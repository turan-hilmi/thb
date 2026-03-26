-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionEnd" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "il" TEXT NOT NULL DEFAULT '',
    "ilce" TEXT NOT NULL DEFAULT '',
    "semt" TEXT NOT NULL DEFAULT '',
    "mahalle" TEXT NOT NULL DEFAULT '',
    "pafta" TEXT NOT NULL DEFAULT '',
    "ada" TEXT NOT NULL DEFAULT '',
    "parsel" TEXT NOT NULL DEFAULT '',
    "yuzolcum" REAL NOT NULL DEFAULT 0,
    "fontSize" INTEGER NOT NULL DEFAULT 8,
    "orientation" TEXT NOT NULL DEFAULT 'Dikey',
    "paperSize" TEXT NOT NULL DEFAULT 'A3',
    "fitToPage" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Owner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL DEFAULT '',
    "isCompany" BOOLEAN NOT NULL DEFAULT false,
    "companyM2" REAL NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,
    "attorneyId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Owner_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Owner_attorneyId_fkey" FOREIGN KEY ("attorneyId") REFERENCES "Attorney" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Share" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pay" INTEGER NOT NULL,
    "payda" INTEGER NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Share_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attorney" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "notaryInfo" TEXT NOT NULL DEFAULT '',
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attorney_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order" INTEGER NOT NULL DEFAULT 0,
    "blokNo" TEXT NOT NULL DEFAULT '',
    "katNo" TEXT NOT NULL DEFAULT '',
    "bagimsizBolumNo" TEXT NOT NULL DEFAULT '',
    "nitelik" TEXT NOT NULL DEFAULT '',
    "brutM2" REAL NOT NULL DEFAULT 0,
    "netM2" REAL NOT NULL DEFAULT 0,
    "arsaPayi" TEXT NOT NULL DEFAULT '',
    "arsaPayiPayda" TEXT NOT NULL DEFAULT '',
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Section_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SectionOwner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sectionId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SectionOwner_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SectionOwner_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SectionOwner_sectionId_ownerId_key" ON "SectionOwner"("sectionId", "ownerId");
