# Observações de Segurança - CyberQuiz

## Análise SAST - Semgrep

### Achado 01: Referências mutáveis no GitHub Actions

- Ferramenta: Semgrep
- Severidade: WARNING
- Ocorrências: 4
- Arquivo: `.github/workflows/devsecops.yml`
- Classificação: risco de supply chain
- Correção: substituição de referências por tags por SHAs completos.
- Validação pendente: nova execução do pipeline.

### Achado 02: Ausência de middleware CSRF

- Ferramenta: Semgrep
- Severidade: INFO
- Ocorrências: 1
- Arquivo: `src/app.js`
- Classificação: não aplicável à arquitetura atual.
- Justificativa: a aplicação disponibiliza um quiz público,
  sem autenticação por cookies, sessões ou operações sensíveis
  associadas a usuários.
- Tratamento: supressão pontual documentada com `nosemgrep`.
- Risco residual: caso sejam adicionadas sessões autenticadas
  ou operações sensíveis, será necessário reavaliar a proteção CSRF.
- Validação pendente: nova execução do pipeline.

## Semgrep: alerta CSRF no Express

- **Regra:** express-check-csurf-middleware-usage
- **Severidade:** INFO
- **Arquivo:** src/app.js
- **Classificação:** não aplicável à arquitetura atual
- **Análise:** a aplicação possui três endpoints públicos.
  Não utiliza autenticação, cookies de sessão ou persistência
  de dados. O POST /api/answer apenas valida uma resposta
  e não altera estado persistente.
- **Tratamento:** supressão pontual documentada com nosemgrep.
- **Risco residual:** a classificação deverá ser revista
  se forem adicionados login, sessões ou operações sensíveis.
- **Evidência:** relatório original semgrep.json.
