<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 9 créditos restantes para usar o sistema de feedback AI.

# Feedback para matheusalencar23:

Nota final: **60.5/100**

# Feedback para matheusalencar23 🚔✨

Olá, Matheus! Primeiro, parabéns pelo esforço e pelo progresso que você já fez nessa etapa tão importante de segurança e autenticação! 🎉 Você implementou várias funcionalidades essenciais, como o cadastro e login de usuários com hash de senhas e JWT, além da estruturação das rotas e controllers seguindo o padrão MVC. Isso já é um grande avanço para uma API profissional e segura.

---

## 🎯 Pontos Positivos — O que você mandou muito bem!

- **Cadastro de usuários com hash de senha:** Você usou o bcrypt para hashear as senhas antes de salvar, o que é a prática correta para segurança.
- **Login com JWT:** Você gera o token JWT com as informações do usuário e um tempo de expiração, o que é ótimo para manter sessões seguras.
- **Estruturação do projeto:** Separou controllers, repositories, rotas e utils, o que facilita a manutenção e escalabilidade.
- **Endpoints de agentes e casos funcionando:** As operações CRUD para agentes e casos estão bem implementadas e com tratamento de erros personalizado, o que melhora a experiência da API.
- **Bônus conquistado:** Você implementou a filtragem simples de casos por status e por agente, o que já mostra que está indo além do básico. Parabéns por esse esforço extra! 🌟

---

## 🔍 O que precisa de atenção — Vamos destrinchar os pontos que travaram seu progresso

### 1. **Falta do middleware de autenticação e proteção das rotas**

Ao analisar seu código, percebi que você não implementou o arquivo `middlewares/authMiddleware.js`, e também não aplicou o middleware para proteger as rotas de `/agentes` e `/casos`. Isso é fundamental para garantir que apenas usuários autenticados possam acessar esses recursos.

No seu `server.js`, você faz:

```js
app.use(casosRouter);
app.use(agentesRouter);
app.use(authRouter);
```

Mas não há nenhuma aplicação de middleware de autenticação para proteger as rotas sensíveis. O correto seria algo assim:

```js
const authMiddleware = require("./middlewares/authMiddleware");

app.use("/agentes", authMiddleware, agentesRouter);
app.use("/casos", authMiddleware, casosRouter);
app.use(authRouter);
```

E o middleware `authMiddleware.js` deve:

- Extrair o token do header `Authorization: Bearer <token>`
- Validar o token JWT usando o segredo do `.env`
- Adicionar os dados do usuário autenticado no `req.user`
- Retornar erro 401 se o token for inválido ou ausente

**Por que isso é importante?**  
Sem essa proteção, qualquer pessoa pode acessar, criar, atualizar ou deletar agentes e casos, o que quebra totalmente a segurança da aplicação. É por isso que você está recebendo erros 401 em várias operações sem o header de autorização.

---

### 2. **Validação dos dados dos usuários no cadastro**

Você está tratando erros quando o email já existe, mas não vi nenhuma validação para garantir que os campos `nome`, `email` e `senha` estejam presentes e com os requisitos mínimos. Por exemplo, seu código não impede que um usuário seja criado com nome vazio, email vazio, senha muito curta, ou senha sem os critérios de complexidade (número, letra maiúscula, caractere especial).

Veja seu trecho do `authController.js`:

```js
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
```

**Aqui falta validação explícita dos campos antes de tentar criar o usuário.**

Você pode usar uma biblioteca como [Zod](https://github.com/colinhacks/zod) (que já está nas suas dependências) para validar o formato e os requisitos da senha e dos campos. Exemplo simples:

```js
const { z } = require("zod");

const userSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  senha: z.string()
    .min(8, "Senha deve ter ao menos 8 caracteres")
    .regex(/[a-z]/, "Senha deve conter letra minúscula")
    .regex(/[A-Z]/, "Senha deve conter letra maiúscula")
    .regex(/[0-9]/, "Senha deve conter número")
    .regex(/[\W_]/, "Senha deve conter caractere especial"),
});

async function signUp(req, res) {
  try {
    userSchema.parse(req.body);
  } catch (error) {
    throw new AppError(400, "Parâmetros inválidos", error.errors.map(e => e.message));
  }
  // restante do código...
}
```

Assim, você garante que o usuário só será criado se todos os requisitos forem cumpridos.

---

### 3. **Tabela de usuários no banco: campo email não está único**

Na sua migration `20250801194155_solution_migrations.js`, a tabela `usuarios` é criada assim:

```js
await knex.schema.createTable("usuarios", function (table) {
  table.increments("id").primary();
  table.string("nome").notNullable();
  table.string("email").notNullable();
  table.string("senha").notNullable();
});
```

Mas o campo `email` precisa ser único para evitar duplicidade, conforme requisito do projeto. A correção é adicionar `.unique()`:

```js
table.string("email").notNullable().unique();
```

Isso evita que o banco aceite dois usuários com o mesmo email, reforçando a integridade dos dados.

---

### 4. **Resposta do login: token deve estar dentro de um objeto com a chave `acess_token`**

No seu `authController.js`, você envia o token assim:

```js
res.status(200).json(token);
```

Mas o requisito pede que retorne um objeto com a propriedade `acess_token` (note a grafia do requisito):

```json
{
  "acess_token": "token aqui"
}
```

Então o correto seria:

```js
res.status(200).json({ acess_token: token });
```

Isso é importante para o frontend ou clientes da API saberem onde encontrar o token e para os testes funcionarem corretamente.

---

### 5. **Endpoint `/usuarios/me` não implementado**

Você não implementou o endpoint que retorna os dados do usuário autenticado (`GET /usuarios/me`), que é um bônus importante para mostrar que o usuário está autenticado e para exibir informações pessoais.

Esse endpoint deve usar o middleware de autenticação para garantir que o usuário está logado, e retornar os dados do usuário (sem a senha).

---

### 6. **Documentação incompleta no INSTRUCTIONS.md**

Seu arquivo `INSTRUCTIONS.md` está básico e não inclui instruções sobre:

- Como registrar e logar usuários (exemplo de payload e resposta)
- Como enviar o token JWT no header `Authorization` para acessar rotas protegidas
- O fluxo esperado de autenticação (login → receber token → usar token nas rotas)

Documentar isso é fundamental para qualquer pessoa que for usar sua API entender como autenticar e proteger as requisições.

---

### 7. **Penalidade: Estrutura de diretórios incompleta**

Na estrutura do seu projeto, não encontrei a pasta `middlewares` nem o arquivo `authMiddleware.js`, que é obrigatório.

Além disso, a organização dos arquivos está boa, mas essa falta quebra a arquitetura esperada do projeto e impacta diretamente a segurança da aplicação.

---

## 💡 Recomendações de aprendizado para você brilhar ainda mais!

- Sobre **middleware de autenticação com JWT** e proteção de rotas, recomendo fortemente este vídeo, feito pelos meus criadores, que explica os conceitos básicos e fundamentais da cibersegurança:  
  https://www.youtube.com/watch?v=Q4LQOfYwujk

- Para entender o uso prático do JWT e como validar tokens, este vídeo é excelente:  
  https://www.youtube.com/watch?v=keS0JWOypIU

- Para combinar JWT com bcrypt (hash de senha) e garantir uma autenticação segura, assista este tutorial:  
  https://www.youtube.com/watch?v=L04Ln97AwoY

- Para aprender a validar dados usando a biblioteca Zod, que vai te ajudar a garantir a qualidade dos dados de entrada:  
  https://www.npmjs.com/package/zod (documentação oficial)

- Para estruturar seu projeto seguindo o padrão MVC e entender a importância da organização, veja este vídeo:  
  https://www.youtube.com/watch?v=bGN_xNc4A1k&t=3s

- Caso tenha dúvidas na configuração do banco com Docker e Knex, este vídeo explica passo a passo:  
  https://www.youtube.com/watch?v=uEABDBQV-Ek&t=1s

---

## ✨ Resumo rápido dos principais pontos para você focar:

- [ ] Implemente o middleware de autenticação JWT (`authMiddleware.js`) e proteja as rotas de `/agentes` e `/casos`.
- [ ] Adicione validações rigorosas para os dados de usuários no cadastro (nome, email, senha com regras de complexidade).
- [ ] Ajuste a migration para tornar o campo `email` da tabela `usuarios` único.
- [ ] Corrija a resposta do login para retornar `{ acess_token: token }` em JSON.
- [ ] Implemente o endpoint `/usuarios/me` para retornar dados do usuário autenticado.
- [ ] Melhore a documentação no `INSTRUCTIONS.md` para incluir exemplos de registro, login e uso do token JWT.
- [ ] Organize a estrutura do projeto para incluir a pasta `middlewares` e o arquivo `authMiddleware.js` conforme o padrão esperado.

---

Matheus, você está no caminho certo, parabéns pelo que já conquistou! 🚀 Agora, com essas melhorias, sua API vai ficar muito mais segura, profissional e pronta para o uso real. Continue firme que você vai dominar esses conceitos fundamentais de autenticação e segurança backend! Se precisar, volte a esses vídeos e documentação para reforçar os conceitos.

Qualquer dúvida, estou aqui para ajudar! 💪😄

Abraços e bons códigos! 👨‍💻✨

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>