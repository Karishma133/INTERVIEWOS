require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const SituationalQuestion = require("./models/SituationalQuestion");

const questions = [
  {
    category: "Crisis Management",
    scenario: "It's 2 AM and the production server just crashed, taking down checkout for your e-commerce site during a big sale. You're the only engineer online. What do you do first?",
    options: [
      { text: "Immediately roll back the last deployment while notifying the team and posting a status update.", effectiveness: 5 },
      { text: "Start debugging the root cause in production before telling anyone, to fix it properly the first time.", effectiveness: 2 },
      { text: "Wait for a senior engineer to wake up and handle it since it's not your usual area.", effectiveness: 1 },
      { text: "Restart the server and hope the issue doesn't recur, then go back to sleep.", effectiveness: 2 },
    ],
    bestOptionExplanation: "In an active outage, restoring service (rollback) and communicating status come first — root-cause analysis can happen once things are stable.",
  },
  {
    category: "Teamwork",
    scenario: "A teammate keeps taking credit for your ideas in meetings in front of your manager. How do you handle it?",
    options: [
      { text: "Talk to them privately and directly, explaining how it made you feel and asking them to credit contributions accurately going forward.", effectiveness: 5 },
      { text: "Call them out publicly in the next meeting to set the record straight immediately.", effectiveness: 2 },
      { text: "Say nothing and just stop sharing ideas with them.", effectiveness: 1 },
      { text: "Complain about them to other teammates without addressing it directly.", effectiveness: 1 },
    ],
    bestOptionExplanation: "A direct, private conversation addresses the issue constructively without escalating conflict or damaging team dynamics.",
  },
  {
    category: "Leadership",
    scenario: "You're leading a small project and realize the deadline is unrealistic given the current progress. What's your best move?",
    options: [
      { text: "Proactively flag the risk to stakeholders early with a clear plan of trade-offs (scope, time, or resources).", effectiveness: 5 },
      { text: "Push the team to work overtime to try to hit the original deadline no matter what.", effectiveness: 2 },
      { text: "Say nothing and hope the team catches up.", effectiveness: 1 },
      { text: "Quietly cut corners on quality/testing to make the date.", effectiveness: 1 },
    ],
    bestOptionExplanation: "Early, transparent communication about risk lets stakeholders make informed trade-off decisions rather than being surprised later.",
  },
  {
    category: "Communication",
    scenario: "During a code review, you strongly disagree with a senior engineer's approach. How do you raise your concern?",
    options: [
      { text: "Ask clarifying questions about their reasoning first, then explain your concern with specific technical trade-offs.", effectiveness: 5 },
      { text: "Approve the PR anyway since they're more senior and you don't want to seem difficult.", effectiveness: 2 },
      { text: "Leave a blunt comment saying the approach is wrong.", effectiveness: 2 },
      { text: "Avoid commenting and complain to a peer instead.", effectiveness: 1 },
    ],
    bestOptionExplanation: "Leading with curiosity (understanding their reasoning) before raising concerns keeps the conversation collaborative and technical, not personal.",
  },
  {
    category: "Ethics",
    scenario: "You discover a bug that's been silently overcharging some customers for months. Fixing it would mean admitting the mistake publicly and possibly issuing refunds. What do you do?",
    options: [
      { text: "Report it immediately to your manager/relevant team with the full scope, and propose a remediation plan including customer refunds.", effectiveness: 5 },
      { text: "Quietly fix the bug going forward without telling anyone about the past overcharges.", effectiveness: 2 },
      { text: "Ignore it since it's not directly your responsibility.", effectiveness: 1 },
      { text: "Wait to see if a customer complains before doing anything.", effectiveness: 1 },
    ],
    bestOptionExplanation: "Transparency and proactive remediation protect both customers and the company's integrity.",
  },
  {
    category: "Crisis Management",
    scenario: "You accidentally deleted a production database table with no recent backup available. What's your immediate next step?",
    options: [
      { text: "Immediately inform your team/manager with full details so recovery efforts can start ASAP.", effectiveness: 5 },
      { text: "Try to quietly recreate the data yourself first to avoid the embarrassment of admitting the mistake.", effectiveness: 1 },
      { text: "Panic and do nothing while deciding how to explain it.", effectiveness: 1 },
      { text: "Check if any read replicas or recent snapshots exist while simultaneously alerting the team.", effectiveness: 5 },
    ],
    bestOptionExplanation: "Speed matters in data-loss incidents — alerting the team immediately maximizes the chance of a successful recovery.",
  },
  {
    category: "Teamwork",
    scenario: "You're paired on a project with someone whose working style is very different from yours (they prefer detailed upfront planning; you prefer iterating quickly). How do you make the collaboration work?",
    options: [
      { text: "Have an open conversation early about both working styles and agree on a hybrid approach both are comfortable with.", effectiveness: 5 },
      { text: "Insist on doing things your way since it's faster.", effectiveness: 1 },
      { text: "Let them lead entirely to avoid friction, even if it slows you down a lot.", effectiveness: 2 },
      { text: "Work around them separately and merge work at the end without much coordination.", effectiveness: 2 },
    ],
    bestOptionExplanation: "Explicitly discussing working-style differences early prevents friction later and produces a process that leverages both people's strengths.",
  },
  {
    category: "Leadership",
    scenario: "A junior teammate submits work with several mistakes right before a client demo. How do you respond?",
    options: [
      { text: "Calmly help them fix the critical issues together, then give private, constructive feedback afterward.", effectiveness: 5 },
      { text: "Criticize them in front of the team to make sure it doesn't happen again.", effectiveness: 1 },
      { text: "Quietly redo all their work yourself without saying anything.", effectiveness: 2 },
      { text: "Escalate immediately to their manager instead of addressing it directly.", effectiveness: 2 },
    ],
    bestOptionExplanation: "Solving the immediate problem calmly while reserving feedback for a private conversation protects both the deliverable and the junior teammate's growth.",
  },
];

(async () => {
  await connectDB();
  await SituationalQuestion.deleteMany({});
  await SituationalQuestion.insertMany(questions);
  console.log(`Seeded ${questions.length} situational judgment scenarios.`);
  await mongoose.connection.close();
  process.exit(0);
})();
