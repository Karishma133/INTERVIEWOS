require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const AptitudeQuestion = require("./models/AptitudeQuestion");

const questions = [
  // Quantitative
  { category: "Quantitative", difficulty: "Easy", question: "A train travels 360 km in 4 hours. What is its speed in km/h?", options: ["80", "90", "100", "72"], correctIndex: 1, explanation: "Speed = Distance / Time = 360 / 4 = 90 km/h." },
  { category: "Quantitative", difficulty: "Easy", question: "What is 15% of 200?", options: ["20", "25", "30", "35"], correctIndex: 2, explanation: "15% of 200 = (15/100) * 200 = 30." },
  { category: "Quantitative", difficulty: "Medium", question: "If the ratio of two numbers is 3:5 and their sum is 64, what is the larger number?", options: ["24", "40", "36", "28"], correctIndex: 1, explanation: "3x + 5x = 64 -> x = 8. Larger number = 5*8 = 40." },
  { category: "Quantitative", difficulty: "Medium", question: "A shopkeeper sells an item for ₹450 at a profit of 20%. What was the cost price?", options: ["₹360", "₹375", "₹400", "₹350"], correctIndex: 1, explanation: "CP = SP / (1 + profit%) = 450 / 1.2 = ₹375." },
  { category: "Quantitative", difficulty: "Hard", question: "Two pipes A and B can fill a tank in 12 and 18 minutes respectively. If both are opened together, how long to fill the tank?", options: ["7.2 min", "6 min", "9 min", "8 min"], correctIndex: 0, explanation: "Combined rate = 1/12 + 1/18 = 5/36. Time = 36/5 = 7.2 minutes." },
  { category: "Quantitative", difficulty: "Medium", question: "What is the compound interest on ₹5000 at 10% per annum for 2 years?", options: ["₹1000", "₹1050", "₹1100", "₹1150"], correctIndex: 1, explanation: "CI = 5000*(1.1)^2 - 5000 = 6050 - 5000 = ₹1050." },
  { category: "Quantitative", difficulty: "Easy", question: "The average of 5 numbers is 20. If one number is removed, the average becomes 18. What was the removed number?", options: ["24", "28", "26", "22"], correctIndex: 1, explanation: "Sum of 5 = 100, sum of 4 = 72. Removed = 100-72 = 28." },

  // Logical
  { category: "Logical", difficulty: "Easy", question: "Find the next number in the series: 2, 6, 12, 20, 30, ?", options: ["40", "42", "38", "44"], correctIndex: 1, explanation: "Differences are 4, 6, 8, 10, 12 -> 30+12 = 42." },
  { category: "Logical", difficulty: "Medium", question: "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?", options: ["Yes", "No", "Cannot be determined", "Only some Bloops"], correctIndex: 0, explanation: "Transitive property: Bloops -> Razzies -> Lazzies, so all Bloops are Lazzies." },
  { category: "Logical", difficulty: "Medium", question: "Pointing to a photograph, a man says: 'She is the daughter of my grandfather's only son.' How is the woman related to the man?", options: ["Sister", "Mother", "Aunt", "Cousin"], correctIndex: 0, explanation: "Grandfather's only son is the man's father, so the woman is his sister." },
  { category: "Logical", difficulty: "Easy", question: "Find the odd one out: Dog, Cat, Lion, Snake, Tiger", options: ["Dog", "Snake", "Cat", "Lion"], correctIndex: 1, explanation: "All others are mammals; snake is a reptile." },
  { category: "Logical", difficulty: "Hard", question: "In a certain code, 'COMPUTER' is written as 'RFUVQNPC'. What pattern is used?", options: ["Shift forward, reverse", "Shift backward, reverse", "Simple reversal only", "Alternate letters swapped"], correctIndex: 0, explanation: "Each letter is shifted forward in the alphabet, then the whole word is reversed." },
  { category: "Logical", difficulty: "Medium", question: "Complete the analogy: Book is to Reading as Fork is to ?", options: ["Drawing", "Writing", "Eating", "Cooking"], correctIndex: 2, explanation: "A book is used for reading; a fork is used for eating." },

  // Verbal
  { category: "Verbal", difficulty: "Easy", question: "Choose the word most similar to 'Abundant':", options: ["Scarce", "Plentiful", "Empty", "Rare"], correctIndex: 1, explanation: "Abundant means existing in large quantities — synonym: plentiful." },
  { category: "Verbal", difficulty: "Easy", question: "Choose the antonym of 'Concise':", options: ["Brief", "Verbose", "Short", "Clear"], correctIndex: 1, explanation: "Concise means brief; the opposite is verbose (wordy)." },
  { category: "Verbal", difficulty: "Medium", question: "Fill in the blank: The manager was ____ to approve the budget without further review.", options: ["reluctant", "reluctantly", "reluctance", "reluctful"], correctIndex: 0, explanation: "'Reluctant' is the correct adjective form fitting grammatically after 'was'." },
  { category: "Verbal", difficulty: "Medium", question: "Identify the correctly punctuated sentence:", options: [
    "Its a great day, isnt it?",
    "It's a great day, isn't it?",
    "Its' a great day, isn't it?",
    "It's a great day, isnt' it?",
  ], correctIndex: 1, explanation: "'It's' (it is) and 'isn't' (is not) both require apostrophes for the contractions." },
  { category: "Verbal", difficulty: "Hard", question: "Choose the sentence with correct subject-verb agreement:", options: [
    "Neither of the developers were available.",
    "Neither of the developers was available.",
    "Neither of the developer was available.",
    "Neither of the developers is available.",
  ], correctIndex: 1, explanation: "'Neither' is singular, so it takes a singular verb: 'was'." },
];

(async () => {
  await connectDB();
  await AptitudeQuestion.deleteMany({});
  await AptitudeQuestion.insertMany(questions);
  console.log(`Seeded ${questions.length} aptitude questions.`);
  await mongoose.connection.close();
  process.exit(0);
})();
