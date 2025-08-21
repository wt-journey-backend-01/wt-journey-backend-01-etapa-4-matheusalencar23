const z = require("zod");
const { validate } = require("./errorHandler");

const newUserValidation = (req, res, next) => {
  const newUser = z.strictObject({
    nome: z.string().min(1, "Nome é obrigatório"),
    email: z.email("Email inválido"),
    senha: z
      .string()
      .min(8, "Senha deve ter ao menos 8 caracteres")
      .regex(/[a-z]/, "Senha deve conter letra minúscula")
      .regex(/[A-Z]/, "Senha deve conter letra maiúscula")
      .regex(/[0-9]/, "Senha deve conter número")
      .regex(/[\W_]/, "Senha deve conter caractere especial"),
  });

  validate(newUser, req.body);
  next();
};

module.exports = {
  newUserValidation,
};
