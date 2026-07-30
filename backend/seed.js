/**
 * Run with: node seed.js
 * Populates the Question collection with a small starter question bank
 * so the adaptive engine and judge have something to work with.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Question = require("./models/Question");

const questions = [
  {
    title: "Two Sum",
    companyTags: ["Google", "Amazon", "Microsoft"],
    description: "Given an array of integers nums and a target, return the indices of the two numbers such that they add up to target.",
    topic: "Array",
    difficulty: "Easy",
    functionName: "solve",
    starterCode: "function solve(nums, target) {\n  // return [i, j]\n}",
    examples: [{ input: "[2,7,11,15], 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9" }],
    constraints: ["2 <= nums.length <= 10^4", "Only one valid answer exists"],
    testCases: [
      { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1], isHidden: false },
      { input: [[3, 2, 4], 6], expectedOutput: [1, 2], isHidden: true },
      { input: [[3, 3], 6], expectedOutput: [0, 1], isHidden: true },
    ],
  },
  {
    title: "Reverse a String",
    companyTags: ["Amazon", "Adobe"],
    description: "Given a string s, return it reversed.",
    topic: "String",
    difficulty: "Easy",
    functionName: "solve",
    starterCode: "function solve(s) {\n  // return reversed string\n}",
    examples: [{ input: '"hello"', output: '"olleh"' }],
    constraints: ["1 <= s.length <= 10^5"],
    testCases: [
      { input: ["hello"], expectedOutput: "olleh", isHidden: false },
      { input: [""], expectedOutput: "", isHidden: true },
      { input: ["a"], expectedOutput: "a", isHidden: true },
    ],
  },
  {
    title: "Valid Parentheses",
    companyTags: ["Google", "Facebook"],
    description: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    topic: "Stack",
    difficulty: "Medium",
    functionName: "solve",
    starterCode: "function solve(s) {\n  // return true/false\n}",
    examples: [{ input: '"()[]{}"', output: "true" }],
    constraints: ["1 <= s.length <= 10^4"],
    testCases: [
      { input: ["()[]{}"], expectedOutput: true, isHidden: false },
      { input: ["(]"], expectedOutput: false, isHidden: true },
      { input: ["{[]}"], expectedOutput: true, isHidden: true },
    ],
  },
  {
    title: "Maximum Subarray (Kadane's Algorithm)",
    companyTags: ["Amazon", "Microsoft", "LinkedIn"],
    description: "Given an integer array nums, find the contiguous subarray with the largest sum, and return its sum.",
    topic: "DynamicProgramming",
    difficulty: "Medium",
    functionName: "solve",
    starterCode: "function solve(nums) {\n  // return max sum\n}",
    examples: [{ input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6" }],
    constraints: ["1 <= nums.length <= 10^5"],
    testCases: [
      { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expectedOutput: 6, isHidden: false },
      { input: [[1]], expectedOutput: 1, isHidden: true },
      { input: [[5, 4, -1, 7, 8]], expectedOutput: 23, isHidden: true },
    ],
  },
  {
    title: "Binary Tree Level Order Traversal",
    companyTags: ["Facebook", "Microsoft"],
    description: "Given the root of a binary tree represented as a nested array [val, left, right] (null for missing), return level order traversal as an array of arrays.",
    topic: "Tree",
    difficulty: "Hard",
    functionName: "solve",
    starterCode: "function solve(tree) {\n  // tree: [val, left, right] or null\n  // return array of arrays\n}",
    examples: [{ input: "[3,[9,null,null],[20,[15,null,null],[7,null,null]]]", output: "[[3],[9,20],[15,7]]" }],
    constraints: ["0 <= number of nodes <= 2000"],
    testCases: [
      {
        input: [[3, [9, null, null], [20, [15, null, null], [7, null, null]]]],
        expectedOutput: [[3], [9, 20], [15, 7]],
        isHidden: false,
      },
      { input: [null], expectedOutput: [], isHidden: true },
      { input: [[1, null, null]], expectedOutput: [[1]], isHidden: true },
    ],
  },
];

(async () => {
  await connectDB();
  await Question.deleteMany({});
  await Question.insertMany(questions);
  console.log(`Seeded ${questions.length} questions.`);
  await mongoose.connection.close();
  process.exit(0);
})();
