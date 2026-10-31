const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../src/app");

test("GET /health retorna status 200", async () => {
  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
});

test("GET /api/questions retorna perguntas", async () => {
  const response = await request(app).get("/api/questions");

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body));
  assert.ok(response.body.length > 0);
});


test("API não expõe o gabarito das perguntas", async () => {
  const response = await request(app).get("/api/questions");

  assert.equal(response.status, 200);

  for (const question of response.body) {
    assert.equal(
      Object.hasOwn(question, "answer"),
      false
    );
  }
});

test("API valida uma resposta correta", async () => {
  const response = await request(app)
    .post("/api/answer")
    .send({
      questionId: 1,
      answer: 0
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.correct, true);
});

test("API rejeita dados inválidos", async () => {
  const response = await request(app)
    .post("/api/answer")
    .send({
      questionId: "invalido",
      answer: null
    });

  assert.equal(response.status, 400);
});

test("API rejeita alternativa fora do intervalo", async () => {
  const response = await request(app)
    .post("/api/answer")
    .send({
      questionId: 1,
      answer: 999
    });

  assert.equal(response.status, 400);
});

