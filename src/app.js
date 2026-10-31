

const express = require("express");
const path = require("node:path");

// Semgrep: CSRF nao se aplica a esta versao do CyberQuiz.
// API publica, sem cookies de sessao, autenticacao ou
// operacoes que alterem estado persistente.
// Reavaliar se forem adicionadas sessoes ou acoes sensiveis.
const app = express(); // nosemgrep: javascript.express.security.audit.express-check-csurf-middleware-usage.express-check-csurf-middleware-usage

app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));

const questions = [
  {
    id: 1,
    question: "O que significa DevSecOps?",
    options: [
      "Desenvolvimento, Segurança e Operações",
      "Desenvolvimento e Servidores",
      "Segurança de Redes",
      "Operações de Banco de Dados"
    ],
    answer: 0
  },
  {
    id: 2,
    question: "Qual ferramenta detecta segredos no Git?",
    options: [
      "Docker",
      "Gitleaks",
      "Jenkins",
      "Nginx"
    ],
    answer: 1
  },
  {
    id: 3,
    question: "Qual ferramenta realiza testes DAST?",
    options: [
      "Git",
      "npm",
      "OWASP ZAP",
      "Docker"
    ],
    answer: 2
  },
  {
    id: 4,
    question: "Qual ferramenta analisa imagens Docker?",
    options: [
      "Trivy",
      "Excel",
      "Photoshop",
      "Notepad"
    ],
    answer: 0
  },
  {
    id: 5,
    question: "O que é uma vulnerabilidade CVE?",
    options: [
      "Um protocolo de rede",
      "Um tipo de firewall",
      "Um identificador de vulnerabilidade conhecida",
      "Um sistema operacional"
    ],
    answer: 2
  }
];

app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    application: "CyberQuiz"
  });
});

app.get("/api/questions", (req, res) => {
  const publicQuestions = questions.map(
    ({ id, question, options }) => ({
      id,
      question,
      options
    })
  );

  res.json(publicQuestions);
});

app.post("/api/answer", (req, res) => {
  const { questionId, answer } = req.body || {};

  if (
    !Number.isInteger(questionId) ||
    !Number.isInteger(answer)
  ) {
    return res.status(400).json({
      error: "Dados inválidos"
    });
  }

  const question = questions.find(q => q.id === questionId);

  if (!question) {
    return res.status(404).json({
      error: "Pergunta não encontrada"
    });
  }

  if (answer < 0 || answer >= question.options.length) {
    return res.status(400).json({
      error: "Alternativa inválida"
    });
  }

  res.json({
    correct: answer === question.answer,
    correctAnswer: question.answer
  });
});

module.exports = app;

