const jwt = require("jsonwebtoken");
const { AppError } = require("../utils/errorHandler");

const SECRET = process.env.JWT_SECRET || "secret";

function authenticateToken(req, res, next) {
  const cookieToken = req.cookies?.token;
  const authHeader = req.headers["authorization"];
  const headerToken = authHeader && authHeader.split(" ")[1];

  const token = cookieToken || headerToken;

  if (!token) {
    next(new AppError(401, "Token não fornecido."));
    return;
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      next(new AppError(403, "Token inválido ou expirado."));
      return;
    }

    req.user = user;
    next();
    return;
  });
}

module.exports = { authenticateToken };
