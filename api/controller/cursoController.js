const { sql } = require("@vercel/postgres");
const jwt = require("jsonwebtoken");

const getCursos = async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', '');
        const filtro = req.query.filtro ? `%${req.query.filtro}%` : null;

        const aluno = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET, (err, a) => {
            if (err) {
                return 0;
            } else {
                return a.id;
            }
        });

        if (req.params.idUsuario && req.params.idUsuario != aluno) {
            return res.status(403).json({message: "Login inválido!"})
        }

        let query = req.params.idUsuario ? 
            sql`SELECT DISTINCT
            c.*,
            CASE WHEN ac.id_curso IS NOT NULL THEN TRUE ELSE FALSE END AS inscrito,
            (SELECT COUNT(*) FROM aluno_curso_bastet WHERE id_curso = c.id) AS inscricoes,
            ac.cancelado as inscricao_cancelada
            FROM aluno_curso_bastet ac
            INNER JOIN curso_bastet c on (c.id = ac.id_curso and ac.id_aluno = ${aluno})
            WHERE c.inicio > ${timestamp}
            ORDER BY inicio ASC`
            : filtro ?
                sql`SELECT DISTINCT
                    c.*,
                    CASE WHEN ac.id_curso IS NOT NULL THEN TRUE ELSE FALSE END AS inscrito,
                    (SELECT COUNT(*) FROM aluno_curso_bastet WHERE id_curso = c.id) AS inscricoes,
                    ac.cancelado as inscricao_cancelada
                    FROM curso_bastet c
                    LEFT JOIN aluno_curso_bastet ac on (c.id = ac.id_curso and ac.id_aluno = ${aluno})
                    WHERE UPPER(nome) LIKE UPPER(${filtro}) AND inicio > ${timestamp}
                    ORDER BY inicio ASC`
                : sql`SELECT DISTINCT
                    c.*,
                    CASE WHEN ac.id_curso IS NOT NULL THEN TRUE ELSE FALSE END AS inscrito,
                    (SELECT COUNT(*) FROM aluno_curso_bastet WHERE id_curso = c.id) AS inscricoes,
                    ac.cancelado as inscricao_cancelada
                    FROM curso_bastet c
                    LEFT JOIN aluno_curso_bastet ac on (c.id = ac.id_curso and ac.id_aluno = ${aluno})
                    WHERE inicio > ${timestamp}
                    ORDER BY inicio ASC`;

        const result = await query;
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar cursos:', error);
        return res.status(200).json([]) // Devido a especificação do trabalho, retorna status 200;
    }
};

module.exports = { getCursos };