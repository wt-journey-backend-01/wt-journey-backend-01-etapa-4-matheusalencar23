const z = require("zod");
const { validate } = require("./errorHandler");

const newUserValidation = (req, res, next) => {
  const newUser = z.strictObject({
    nome: z.string().min(1, "Nome é obrigatório"),
    email: z.email("Email inválido"),
    senha: z.string().min(1, "Senha é obrigatória"),
  });

  validate(newUser, req.body);
  next();
};

module.exports = {
  newUserValidation,
};
