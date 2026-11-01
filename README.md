# CyberQuiz | Pipeline DevSecOps

## Equipe

| Integrante | RM |
|---|---|
| Enzo Marins Bernardello | RM561619 |
| Lincoln Vieira de Paula | RM565842 |
| Rafaela Christine Pereira Bassi | RM561715 |

- **Instituição:** FIAP
- **Projeto:** CyberQuiz DevSecOps
- **Curso:** Cybersecurity
- **Turma:** 2TDCPG

![Pipeline DevSecOps](https://github.com/EMB08/cyberquiz-devsecops/actions/workflows/devsecops.yml/badge.svg)

Aplicação web de perguntas e respostas sobre segurança da informação, desenvolvida como projeto acadêmico da **FIAP**, com foco na implementação de uma esteira CI/CD integrada a práticas de **DevSecOps**.

O projeto utiliza Node.js, Express, Docker, GitHub Actions e ferramentas de análise de segurança para validar código, dependências, imagem de contêiner e aplicação em execução antes da publicação em produção.

## Aplicação em produção

**[Acessar o CyberQuiz](https://cyberquiz-devsecops.onrender.com)**

A aplicação está hospedada no Render, com implantação automatizada e aprovação humana obrigatória antes do deploy em produção.

> O serviço utiliza infraestrutura gratuita e pode levar alguns instantes para responder após períodos de inatividade.

## Tecnologias utilizadas

| Categoria | Tecnologia |
|---|---|
| Backend | Node.js 24, Express 5 |
| Frontend | HTML, CSS e JavaScript |
| Segurança HTTP | Helmet |
| Testes | Node.js Test Runner e Supertest |
| Contêiner | Docker |
| CI/CD | GitHub Actions |
| Detecção de segredos | Gitleaks |
| Análise estática (SAST) | Semgrep |
| Análise de dependências (SCA) | Trivy |
| Análise de imagem Docker | Trivy |
| Análise dinâmica (DAST) | OWASP ZAP |
| Registro de imagens | GitHub Container Registry (GHCR) |
| Hospedagem | Render |

## Executar localmente

### Pré-requisitos

- Node.js 24
- npm
- Git

### Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/EMB08/cyberquiz-devsecops.git
cd cyberquiz-devsecops
npm ci
```

### Executar os testes

```bash
npm test
```

O projeto possui seis testes automatizados para validar o comportamento da aplicação.

### Iniciar a aplicação

```bash
npm start
```

Por padrão, a aplicação utiliza a porta `3000`, podendo ser alterada pela variável de ambiente `PORT`.

Acesse:

- Aplicação: `http://localhost:3000`
- Health check: `http://localhost:3000/health`

## API

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/health` | Verificação de saúde da aplicação |
| GET | `/api/questions` | Consulta às perguntas do quiz |
| POST | `/api/answer` | Validação de uma resposta |

## Pipeline DevSecOps

A esteira é executada pelo GitHub Actions e contém **nove jobs**:

| Etapa | Job | Ferramenta / atividade |
|---|---|---|
| 01 | Secrets Scan | Gitleaks para detecção de segredos |
| 02 | SAST | Semgrep para análise estática do código |
| 03 | Build e Testes | Instalação, testes automatizados e auditoria npm |
| 04 | SCA | Trivy para análise do projeto e dependências |
| 05 | Docker Build | Construção e publicação da imagem no GHCR |
| 06 | Image Scan | Trivy para análise de vulnerabilidades na imagem |
| 07 | DAST | OWASP ZAP em ambiente de homologação |
| 08 | Deploy em Produção | Aprovação humana, deploy no Render e health check |
| 09 | Pipeline Summary | Consolidação dos resultados e publicação de relatório |

Os controles de segurança bloqueantes impedem que falhas críticas avancem para produção. A análise DAST utiliza uma abordagem informativa, permitindo registrar alertas e riscos residuais para avaliação.

A etapa de produção exige aprovação humana pelo ambiente protegido do GitHub Actions. A imagem implantada é verificada por digest SHA-256, garantindo a correspondência com a imagem aprovada na esteira.

O job `pipeline-summary` utiliza execução incondicional em relação ao resultado das etapas anteriores, permitindo registrar sucessos, falhas e etapas ignoradas.

### Execução validada

- **[Pipeline com nove jobs concluídos com sucesso](https://github.com/EMB08/cyberquiz-devsecops/actions/runs/41334618244)**
- **[Artifact do resumo consolidado](https://github.com/EMB08/cyberquiz-devsecops/actions/runs/41334618244/artifacts/13094676897)**

O resumo consolidado também é exibido na aba **Summary** da execução, contendo o resultado de cada uma das oito etapas principais.

## Segurança e rastreabilidade

O projeto adota práticas como:

- Referências de GitHub Actions fixadas por SHA completo.
- Verificação automatizada de segredos.
- Análise estática e de dependências.
- Bloqueio por vulnerabilidades HIGH/CRITICAL conforme os critérios dos scanners.
- Imagem Docker com dependências de produção e execução sem usuário root.
- Publicação de imagem identificada por commit e digest.
- Aprovação humana para deploy em produção.
- Validação do deploy e health check.
- Relatórios armazenados como artifacts do GitHub Actions.

Os alertas identificados, as correções realizadas, as justificativas de falsos positivos e os riscos residuais estão documentados em [Observações de Segurança](docs/observacoes.md).

## Documentação

- [Detalhamento da pipeline](docs/pipeline.md)
- [Observações e análise de segurança](docs/observacoes.md)
- [Evidências de execução](docs/evidencias/)
