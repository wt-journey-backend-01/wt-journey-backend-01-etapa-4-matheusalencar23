const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const usuariosRepository = require("../repositories/usuariosRepository");
const { AppError } = require("../utils/errorHandler");

const SECRET = process.env.JWT_SECRET || "secret";

async function login(req, res) {
  const { email, senha, nome } = req.body;

  const usuario = await usuariosRepository.findByEmail(email);

  if (!usuario) {
    throw new AppError(
      404,
      "Nenhum usuário encontrado para o email especificado"
    );
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);

  if (!senhaValida) {
    throw new AppError(401, "Credenciais inválidas");
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
    },
    SECRET,
    { expiresIn: "1d" }
  );

  res.status(200).json({ access_token: token });
}

async function signUp(req, res) {
  const { nome, email, senha } = req.body;

  const usuario = await usuariosRepository.findByEmail(email);

  if (usuario) {
    throw new AppError(
      400,
      "Já existe um usuário cadastrado com o email especificado"
    );
  }

  const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS) || 10);
  const hash = await bcrypt.hash(senha, salt);

  const novoUsuario = await usuariosRepository.create({
    nome,
    email,
    senha: hash,
  });

  delete novoUsuario.senha;
  res.status(201).json(novoUsuario);
}

module.exports = {
  login,
  signUp,
};
