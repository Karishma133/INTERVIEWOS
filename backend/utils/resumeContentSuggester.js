/**
 * resumeContentSuggester.js
 * -----------------------------------------------------------------------
 * For students who "don't know how to write a resume" — this generates
 * ready-to-use, editable draft text from structured inputs (skills, tech
 * stack, project type). Template + keyword based, not an LLM call.
 * -----------------------------------------------------------------------
 */

const ACTION_VERBS_BY_CONTEXT = {
  build: ["Built", "Developed", "Engineered", "Implemented", "Designed"],
  improve: ["Optimized", "Improved", "Enhanced", "Refactored", "Streamlined"],
  lead: ["Led", "Collaborated on", "Coordinated", "Mentored", "Drove"],
};

const TECH_BULLET_TEMPLATES = {
  react: "{verb} a responsive {adjective} interface using React, improving user experience and reducing load time.",
  node: "{verb} RESTful APIs with Node.js and Express, handling {scale} concurrent requests reliably.",
  mongodb: "{verb} a MongoDB schema and query layer optimized for {scale}, reducing average query time.",
  express: "{verb} backend services using Express.js with middleware-based authentication and error handling.",
  python: "{verb} data processing scripts in Python, automating manual workflows and reducing processing time.",
  "socket.io": "{verb} real-time features using Socket.io/WebSockets for live updates across {scale} concurrent users.",
  default: "{verb} a {adjective} feature using {tech}, contributing directly to the project's core functionality.",
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateSummary({ headline, skills = [], yearsExperience = 0, projectCount = 0 }) {
  const topSkills = skills.slice(0, 5).join(", ");
  const experienceLine = yearsExperience > 0
    ? `${yearsExperience}+ year${yearsExperience > 1 ? "s" : ""} of hands-on experience`
    : "hands-on project experience";

  const projectLine = projectCount > 0
    ? ` Built and shipped ${projectCount} full-stack project${projectCount > 1 ? "s" : ""} independently.`
    : "";

  return `${headline || "Aspiring software developer"} with ${experienceLine} in ${topSkills || "modern web technologies"}. `
    + `Strong foundation in problem-solving and Data Structures & Algorithms, with a track record of writing clean, maintainable code.${projectLine} `
    + `Seeking to contribute technical skills and a growth mindset to a product-focused engineering team.`;
}

function suggestProjectBullets(techUsed = []) {
  const suggestions = [];
  const lowerTech = techUsed.map((t) => t.toLowerCase());

  for (const tech of lowerTech.slice(0, 3)) {
    const template = TECH_BULLET_TEMPLATES[tech] || TECH_BULLET_TEMPLATES.default;
    const verb = pick(ACTION_VERBS_BY_CONTEXT.build);
    suggestions.push(
      template
        .replace("{verb}", verb)
        .replace("{adjective}", pick(["scalable", "user-friendly", "high-performance", "modular"]))
        .replace("{scale}", pick(["hundreds of", "thousands of", "high-volume"]))
        .replace("{tech}", techUsed[lowerTech.indexOf(tech)] || tech)
    );
  }

  if (suggestions.length === 0) {
    suggestions.push(`${pick(ACTION_VERBS_BY_CONTEXT.build)} a full-stack application covering both frontend and backend functionality.`);
  }

  suggestions.push(`${pick(ACTION_VERBS_BY_CONTEXT.improve)} application performance and code quality through iterative testing and refactoring.`);

  return suggestions;
}

module.exports = { generateSummary, suggestProjectBullets };
