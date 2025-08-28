const jwt = require("jsonwebtoken");
const { AppError } = require("../utils/errorHandler");

const SECRET = process.env.JWT_SECRET || "secret";

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      next(new AppError(401, "Token não fornecido."));
      return;
    }

    const headerToken = authHeader && authHeader.split(" ")[1];
    const token = headerToken;

    if (!token) {
      next(new AppError(401, "Token não fornecido."));
      return;
    }

    jwt.verify(token, SECRET, (err, user) => {
      if (err) {
        next(new AppError(401, "Token inválido ou expirado."));
        return;
      }

      req.user = user;
      next();
      return;
    });
  } catch (e) {
    next(new AppError(401, "Token inválido ou expirado."));
    return;
  }
}

module.exports = { authenticateToken };
