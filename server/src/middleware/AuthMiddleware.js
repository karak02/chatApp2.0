const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ status: 401, message: "Unauthorized" });
  }
  
  const token = authHeader.split(" ")[1];

  // Verify the JWT token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ status: 401, message: "Unauthorized" });
    }
    req.user = user; // Attach the user to the request object
    next();
  });
};

module.exports = authMiddleware;
