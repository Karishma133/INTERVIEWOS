const { reviewArchitecture } = require("../utils/architectureReview");

// POST /api/architecture/review  { shapes, connectors }
const reviewBoard = async (req, res) => {
  try {
    const { shapes = [], connectors = [] } = req.body;
    const result = reviewArchitecture(shapes, connectors);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { reviewBoard };
