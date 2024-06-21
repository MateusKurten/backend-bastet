require('dotenv').config({ path: '.env.development.local' });
const express = require('express')
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const cursoController = require('./controller/cursoController')
const alunoController = require('./controller/alunoController');
const { auth } = require('./middleware/auth');

const port = 3333;

app.use(cors({
    origin: 'https://front-bastet-one.vercel.app/',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.send("Express on Vercel"));
app.get("/cursos", cursoController.getCursos);
app.get("/:idUsuario", auth, cursoController.getCursos);
app.post("/cursos/:idCurso", auth, alunoController.realizarInscricao);
app.patch("/cursos/:idCurso", auth, alunoController.cancelarInscricao);
app.post("/usuarios", alunoController.criarCadastro)
app.post("/login", alunoController.login)

app.listen(port, () => {
    console.log(`Server running at port ${port}`);
})

module.exports = app;