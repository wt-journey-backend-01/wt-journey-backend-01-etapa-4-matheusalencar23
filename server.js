const express = require("express");
require("dotenv").config();
const swagger = require("./docs/swagger");
const { authenticateToken } = require("./middlewares/authMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

const agentesRouter = require("./routes/agentesRoutes");
const casosRouter = require("./routes/casosRoutes");
const authRouter = require("./routes/authRoutes");
const { errorHandler } = require("./utils/errorHandler");

app.use(express.json());

app.use(authRouter);
app.use("/casos", authenticateToken, casosRouter);
app.use("/agentes", authenticateToken, agentesRouter);

swagger(app);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor do Departamento de Polícia rodando na porta:${PORT}`);
});
