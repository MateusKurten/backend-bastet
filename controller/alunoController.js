const { sql } = require("@vercel/postgres");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");


const getCadastro = async (email) => {
    try {
        const result = await sql`SELECT * FROM aluno_bastet WHERE email = ${email}`;

        return result.rows[0];
    } catch {
        return false
    }
}

const login = async (req, res) => {
    if (!req.body.email || !req.body.senha) {
        return res.status(400).json({message: "Usuario e senha obrigatórios!"})
    }

    const aluno = await getCadastro(req.body.email);

    if (!aluno) {
        return res.status(400).json({message: "Usuario ou senha não confere"});
    }

    const compare = bcrypt.compareSync(req.body.senha, aluno.senha)

    if (!compare) {
        return res.status(400).json({message: "Usuario ou senha não confere"});
    }

    const token = jwt.sign({id: aluno.id}, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.cookie('jwt', token, {
        httpOnly: true,
    });

    return res.status(200).json({
        message: "Login realizado com sucesso!",
        token: token,
        id: aluno.id
    });
}

const criarCadastro = async (req, res) => {
    if (!req.body.nome || !req.body.email) {
        res.status(400).json({message: "Usuario e senha obrigatórios!"})
    }

    try {
        aluno = {
            nome: req.body.nome,
            email: req.body.email,
            nascimento: req.body.nascimento,
            senha: bcrypt.hashSync(req.body.senha, 10)
        }

        await sql`INSERT INTO aluno_bastet(nome, email, senha, nascimento) VALUES (${aluno.nome}, ${aluno.email}, ${aluno.senha}, ${aluno.nascimento})`;
        res.status(200).json({message: "Cadastro realizado com sucesso!"});
    } catch (error) {
        res.status(400).json({message: "Erro: " + error.message});
    }
};

const realizarInscricao = async (req, res) => {
    if (!req.params.idCurso) {
        res.status(400).json({message: "Curso obrigatório!"})
    }

    try {
        curso = await sql`SELECT id FROM curso_bastet WHERE id = ${req.params.idCurso}`;

        if (curso.length === 0) {
            res.status(404).json({message: "Curso não existe!"})
        }

        await sql`INSERT INTO aluno_curso_bastet (id_aluno, id_curso) values (${req.aluno.id}, ${curso.rows[0].id})`;

        res.status(200).json({ message: 'Inscrição realizada com sucesso!' });
    } catch (error) {
        res.status(400).json({ message: "Erro: " + error.message})
    }
};

const cancelarInscricao = async (req, res) => {
    if (!req.params.idCurso) {
        res.status(400).json({message: "Curso obrigatório!"})
    }

    try {
        curso = await sql`SELECT id FROM curso_bastet WHERE id = ${req.params.idCurso}`;

        if (curso.length === 0) {
            res.status(404).json({message: "Curso não existe!"})
        }

        const dataCancelamento = new Date();

        await sql`UPDATE aluno_curso_bastet SET 
            cancelado = 1,
            data_cancelamento = ${dataCancelamento.toISOString()}
            WHERE id_aluno = ${req.aluno.id} 
            AND id_curso = ${curso.rows[0].id}`;

        res.status(200).json({ message: 'Inscrição cancelada com sucesso!' });
    } catch (error) {
        res.status(400).json({ message: "Erro: " + error.message})
    }
};

module.exports = { criarCadastro, login, realizarInscricao, cancelarInscricao };