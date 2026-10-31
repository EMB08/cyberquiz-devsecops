
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");

const startBtn = document.getElementById("start-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");

let questions = [];
let currentIndex = 0;
let score = 0;
let answered = false;

async function startGame() {
  startBtn.disabled = true;
  restartBtn.disabled = true;

  try {
    const response = await fetch("/api/questions");

    if (!response.ok) {
      throw new Error("Falha ao carregar perguntas");
    }

    questions = await response.json();

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Nenhuma pergunta disponível");
    }

    currentIndex = 0;
    score = 0;

    startScreen.classList.add("hidden");
    resultScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    showQuestion();
  } catch (error) {
    alert("Não foi possível iniciar o jogo. Tente novamente.");
    console.error(error);
  } finally {
    startBtn.disabled = false;
    restartBtn.disabled = false;
  }
}

function showQuestion() {
  answered = false;
  nextBtn.classList.add("hidden");

  document.getElementById("feedback").textContent = "";
  document.getElementById("score").textContent =
    `Pontos: ${score}`;

  const question = questions[currentIndex];

  document.getElementById("question").textContent =
    question.question;

  document.getElementById("progress-text").textContent =
    `Pergunta ${currentIndex + 1}/${questions.length}`;

  document.getElementById("progress-fill").style.width =
    `${(currentIndex / questions.length) * 100}%`;

  const optionsContainer = document.getElementById("options");
  optionsContainer.replaceChildren();

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "option";
    button.textContent = option;
    button.addEventListener("click", () => {
      submitAnswer(question.id, index);
    });

    optionsContainer.appendChild(button);
  });
}

async function submitAnswer(questionId, answer) {
  if (answered) return;

  answered = true;

  const buttons = document.querySelectorAll(".option");
  buttons.forEach(button => button.disabled = true);

  try {
    const response = await fetch("/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ questionId, answer })
    });

    if (!response.ok) {
      throw new Error("Falha ao validar resposta");
    }

    const result = await response.json();

    if (result.correct) {
      score += 100;
    }

    buttons.forEach((button, index) => {
      if (index === result.correctAnswer) {
        button.classList.add("correct");
      } else if (index === answer) {
        button.classList.add("wrong");
      }
    });

    document.getElementById("feedback").textContent =
      result.correct
        ? "✓ Resposta correta! +100 pontos"
        : "✗ Resposta incorreta!";

    document.getElementById("score").textContent =
      `Pontos: ${score}`;

    nextBtn.classList.remove("hidden");
  } catch (error) {
    answered = false;
    buttons.forEach(button => button.disabled = false);
    document.getElementById("feedback").textContent =
      "Erro de conexão. Tente novamente.";
    console.error(error);
  }
}

function nextQuestion() {
  currentIndex++;

  if (currentIndex < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  gameScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  const maximum = questions.length * 100;
  const percentage = Math.round((score / maximum) * 100);

  document.getElementById("final-score").textContent =
    `${score} / ${maximum}`;

  document.getElementById("result-message").textContent =
    percentage >= 80
      ? "Excelente! Você domina os fundamentos!"
      : percentage >= 50
        ? "Bom trabalho! Continue estudando."
        : "Continue treinando suas habilidades!";
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
nextBtn.addEventListener("click", nextQuestion);

