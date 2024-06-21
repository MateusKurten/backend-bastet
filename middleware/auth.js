const jwt = require("jsonwebtoken");

async function auth(req, res, next) {
    const jwtToken = req.body.jwt ?? (req.query.jwt ?? '');
    if (jwtToken) {
        jwt.verify(jwtToken, process.env.JWT_SECRET, (err, aluno) => {
            if (err) {
                return res.status(403).json({message: "Login inválido!"});
            } else {
                req.aluno = aluno
                next();
            }
        });
    } else {
        return res.status(403).json({message: "Usuário precisa estar logado!"});
    }
}

module.exports = { auth }