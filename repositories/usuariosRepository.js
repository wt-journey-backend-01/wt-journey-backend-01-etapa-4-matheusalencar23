const db = require("../db/db");
const { AppError } = require("../utils/errorHandler");

async function findByEmail(email) {
  try {
    console.log(email);
    const result = await db("usuarios")
      .select("*")
      .where({ nome: email })
      .first();
    return result;
  } catch (error) {
    throw new AppError(500, "Erro ao buscar usuário por email", [
      error.message,
    ]);
  }
}

async function create(usuario) {
  try {
    const [newUsuario] = await db("usuarios").insert(usuario).returning("*");
    return newUsuario;
  } catch (error) {
    throw new AppError(500, "Erro ao cadastrar usuário", [error.message]);
  }
}

module.exports = {
  findByEmail,
  create,
};
