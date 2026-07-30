/**
 * architectureReview.js
 * -----------------------------------------------------------------------
 * "AI Behavioral & System Design Evaluator" — analyzes the shapes and
 * connectors drawn on the System Design Whiteboard for common
 * architectural red flags (single points of failure, missing load
 * balancing, disconnected components, etc). This is graph-pattern
 * analysis over the diagram's structure, NOT a real AI/LLM call — but it
 * catches the same issues a system design interviewer would flag.
 * -----------------------------------------------------------------------
 */

function buildGraph(shapes, connectors) {
  const incoming = {};
  const outgoing = {};
  shapes.forEach((s) => { incoming[s.id] = []; outgoing[s.id] = []; });
  connectors.forEach((c) => {
    if (outgoing[c.fromShapeId]) outgoing[c.fromShapeId].push(c.toShapeId);
    if (incoming[c.toShapeId]) incoming[c.toShapeId].push(c.fromShapeId);
  });
  return { incoming, outgoing };
}

function reviewArchitecture(shapes = [], connectors = []) {
  const findings = [];
  if (shapes.length === 0) {
    return { score: 0, findings: [{ severity: "Info", message: "Board is empty — add some components to get a review." }] };
  }

  const { incoming, outgoing } = buildGraph(shapes, connectors);
  const typeCount = (type) => shapes.filter((s) => s.type === type).length;
  const hasType = (type) => typeCount(type) > 0;

  if (!hasType("client")) {
    findings.push({ severity: "Medium", message: "No Client/User component — it's unclear how traffic actually enters this system." });
  }

  const computeTypes = ["ec2", "lambda"];
  const computeCount = shapes.filter((s) => computeTypes.includes(s.type)).length;
  if (computeCount >= 2 && !hasType("lb")) {
    findings.push({ severity: "High", message: `${computeCount} compute components (EC2/Lambda) but no Load Balancer — no traffic distribution or failover if one instance goes down.` });
  }

  const dbShapes = shapes.filter((s) => s.type === "db");
  if (dbShapes.length === 1) {
    const inCount = incoming[dbShapes[0].id]?.length || 0;
    if (inCount >= 2) {
      findings.push({ severity: "Medium", message: "Single database instance receiving multiple connections — a common single point of failure. Consider read replicas or a caching layer." });
    }
  }

  const clientShapes = shapes.filter((s) => s.type === "client");
  connectors.forEach((c) => {
    const from = shapes.find((s) => s.id === c.fromShapeId);
    const to = shapes.find((s) => s.id === c.toShapeId);
    if (from?.type === "client" && to?.type === "db") {
      findings.push({ severity: "High", message: "Client is connected directly to the Database, bypassing any application/API layer — a common security and coupling anti-pattern." });
    }
  });

  shapes.forEach((s) => {
    const inCount = incoming[s.id]?.length || 0;
    if (inCount >= 3 && !hasType("queue")) {
      findings.push({ severity: "Low", message: `"${s.label}" receives ${inCount} incoming connections with no Queue/Broker in the diagram — consider a message queue to smooth traffic spikes.` });
    }
  });

  shapes.forEach((s) => {
    const totalConns = (incoming[s.id]?.length || 0) + (outgoing[s.id]?.length || 0);
    if (totalConns === 0 && shapes.length > 1) {
      findings.push({ severity: "Low", message: `"${s.label}" isn't connected to anything else on the board — is it part of the flow?` });
    }
  });

  if (hasType("lb") && computeCount >= 2) {
    findings.push({ severity: "Good", message: "Load balancer in front of multiple compute nodes — solid pattern for availability and horizontal scaling." });
  }
  if (hasType("queue")) {
    findings.push({ severity: "Good", message: "Message queue present — good for decoupling services and absorbing traffic spikes." });
  }
  if (clientShapes.length > 0 && dbShapes.length > 0 && !connectors.some((c) => {
    const from = shapes.find((s) => s.id === c.fromShapeId);
    const to = shapes.find((s) => s.id === c.toShapeId);
    return from?.type === "client" && to?.type === "db";
  })) {
    findings.push({ severity: "Good", message: "Client is not directly wired to the database — proper layering." });
  }

  const negativeCount = findings.filter((f) => ["High", "Medium", "Low"].includes(f.severity)).length;
  const score = Math.max(0, 100 - negativeCount * 15);

  if (findings.length === 0) {
    findings.push({ severity: "Info", message: "Add connectors between your components (Connect mode) to get a meaningful review." });
  }

  return { score, findings };
}

module.exports = { reviewArchitecture };
