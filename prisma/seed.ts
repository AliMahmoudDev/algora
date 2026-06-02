import { db } from '../src/lib/db';
import { mockProblems } from '../src/data/mock-problems';

// Starter code per problem slug (extracted from the problem view page)
const starterCodeMap: Record<string, Record<string, string>> = {
  'two-sum': {
    python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your solution here\n        pass`,
    javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Write your solution here\n}`,
    cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n    }\n};`,
    java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n    }\n}`,
  },
  'valid-palindrome': {
    python: `class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        # Write your solution here\n        pass`,
    javascript: `function isPalindrome(s) {\n    // Write your solution here\n}`,
    cpp: `class Solution {\npublic:\n    bool isPalindrome(string s) {\n        // Write your solution here\n    }\n};`,
    java: `class Solution {\n    public boolean isPalindrome(String s) {\n        // Write your solution here\n    }\n}`,
  },
  'binary-search': {
    python: `class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        # Write your solution here\n        pass`,
    javascript: `function search(nums, target) {\n    // Write your solution here\n}`,
    cpp: `class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write your solution here\n    }\n};`,
    java: `class Solution {\n    public int search(int[] nums, int target) {\n        // Write your solution here\n    }\n}`,
  },
};

const defaultStarterCode: Record<string, string> = {
  python: `class Solution:\n    def solve(self) -> None:\n        # Write your solution here\n        pass`,
  javascript: `function solve() {\n    // Write your solution here\n}`,
  cpp: `class Solution {\npublic:\n    // Write your solution here\n};`,
  java: `class Solution {\n    // Write your solution here\n}`,
};

async function seed() {
  console.log('🌱 Seeding problems into database...');

  let created = 0;
  let updated = 0;

  for (const problem of mockProblems) {
    const starterCode = starterCodeMap[problem.slug] || defaultStarterCode;
    const testCases = problem.examples.map((e) => ({
      input: e.input,
      expectedOutput: e.output,
    }));

    const data = {
      id: problem.id,
      title: problem.title,
      titleAr: problem.titleAr,
      slug: problem.slug,
      description: problem.description,
      descriptionAr: problem.descriptionAr,
      difficulty: problem.difficulty,
      category: problem.category,
      tags: JSON.stringify(problem.tags),
      examples: JSON.stringify(problem.examples),
      constraints: problem.constraints,
      constraintsAr: problem.constraintsAr,
      acceptanceRate: problem.acceptanceRate,
      starterCode: JSON.stringify(starterCode),
      testCases: JSON.stringify(testCases),
      orderIndex: problem.orderIndex,
      isPublished: true,
    };

    // Use upsert for idempotency (SQLite-compatible)
    const result = await db.problem.upsert({
      where: { slug: problem.slug },
      update: data,
      create: data,
    });

    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      created++;
    } else {
      updated++;
    }

    console.log(`  ✓ ${problem.orderIndex}. ${problem.title} (${problem.slug})`);
  }

  console.log(`\n✅ Seed complete! Created: ${created}, Updated: ${updated}`);
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });
