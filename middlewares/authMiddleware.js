const jwt = require("jsonwebtoken");
const { AppError } = require("../utils/errorHandler");

const SECRET = process.env.JWT_SECRET || "secret";

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return next(new AppError(401, "Token não fornecido."));
    }

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return next(new AppError(401, "Token não fornecido."));
    }

    jwt.verify(token, SECRET, (err, user) => {
      if (err) {
        return next(new AppError(401, "Token inválido ou expirado."));
      }

      req.user = user;
      next();
    });
  } catch (e) {
    console.log("teste de erro", e);
    next(new AppError(401, "Token inválido ou expirado."));
  }
}

module.exports = { authenticateToken };
