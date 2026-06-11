-- Algora Database Schema for Supabase
-- Run this in Supabase Dashboard → SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (synced with Supabase Auth)
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT,
  "image" TEXT,
  "emailVerified" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Problems table
CREATE TABLE IF NOT EXISTS "Problem" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "titleAr" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT NOT NULL,
  "descriptionAr" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL DEFAULT 'Easy',
  "category" TEXT NOT NULL,
  "tags" TEXT NOT NULL DEFAULT '[]',
  "examples" TEXT NOT NULL DEFAULT '[]',
  "constraints" TEXT,
  "constraintsAr" TEXT,
  "acceptanceRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "starterCode" TEXT,
  "testCases" TEXT,
  "hints" TEXT,
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Submissions table
CREATE TABLE IF NOT EXISTS "Submission" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "code" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Wrong Answer',
  "runtime" DOUBLE PRECISION,
  "memory" DOUBLE PRECISION,
  "testCasesPassed" INTEGER NOT NULL DEFAULT 0,
  "testCasesTotal" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "problemId" TEXT NOT NULL REFERENCES "Problem"("id") ON DELETE CASCADE
);

-- UserProblem table (tracks user progress per problem)
CREATE TABLE IF NOT EXISTS "UserProblem" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "status" TEXT NOT NULL DEFAULT 'Not Started',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "bestRuntime" DOUBLE PRECISION,
  "bestMemory" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "problemId" TEXT NOT NULL REFERENCES "Problem"("id") ON DELETE CASCADE,
  CONSTRAINT "UserProblem_userId_problemId_key" UNIQUE("userId", "problemId")
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS "Submission_userId_idx" ON "Submission"("userId");
CREATE INDEX IF NOT EXISTS "Submission_problemId_idx" ON "Submission"("problemId");
CREATE INDEX IF NOT EXISTS "UserProblem_userId_idx" ON "UserProblem"("userId");
CREATE INDEX IF NOT EXISTS "UserProblem_problemId_idx" ON "UserProblem"("problemId");
CREATE INDEX IF NOT EXISTS "Problem_difficulty_idx" ON "Problem"("difficulty");
CREATE INDEX IF NOT EXISTS "Problem_category_idx" ON "Problem"("category");

-- Enable Row Level Security
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Problem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Submission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserProblem" ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Problems: anyone can read published problems
CREATE POLICY "Problems published read" ON "Problem"
  FOR SELECT USING ("isPublished" = true);

-- Submissions: users can read/write their own
CREATE POLICY "Submissions own read" ON "Submission"
  FOR SELECT USING ("userId" = auth.uid());

CREATE POLICY "Submissions own insert" ON "Submission"
  FOR INSERT WITH CHECK ("userId" = auth.uid());

-- UserProblem: users can read/write their own
CREATE POLICY "UserProblem own read" ON "UserProblem"
  FOR SELECT USING ("userId" = auth.uid());

CREATE POLICY "UserProblem own insert" ON "UserProblem"
  FOR INSERT WITH CHECK ("userId" = auth.uid());

CREATE POLICY "UserProblem own update" ON "UserProblem"
  FOR UPDATE USING ("userId" = auth.uid());

-- User: users can read/update their own profile
CREATE POLICY "User own read" ON "User"
  FOR SELECT USING ("id" = auth.uid());

CREATE POLICY "User own update" ON "User"
  FOR UPDATE USING ("id" = auth.uid());

CREATE POLICY "User own insert" ON "User"
  FOR INSERT WITH CHECK ("id" = auth.uid());
