# Observações de Segurança - CyberQuiz

## 1. Objetivo

Este documento registra os achados das ferramentas de segurança utilizadas na pipeline DevSecOps do CyberQuiz, as correções realizadas, as justificativas para alertas não aplicáveis, os riscos residuais e as lições aprendidas.

A análise considera as execuções de desenvolvimento e a execução validada da pipeline com nove jobs concluídos com sucesso.

**Execução validada:** https://github.com/EMB08/cyberquiz-devsecops/actions/runs/41334618244

## 2. Achados SAST - Semgrep

### Achado 01: Referências mutáveis no GitHub Actions

- **Ferramenta:** Semgrep
- **Severidade original:** WARNING
- **Ocorrências identificadas:** 4
- **Arquivo:** `.github/workflows/devsecops.yml`
- **Classificação:** risco de supply chain
- **Problema:** referências mutáveis de ações externas podem permitir que o código executado seja alterado sem uma mudança explícita no workflow.
- **Correção:** substituição das referências por SHAs completos das ações utilizadas.
- **Validação:** pipeline executada com sucesso após a correção.
- **Situação:** tratado.

### Achado 02: Ausência de middleware CSRF

- **Ferramenta:** Semgrep
- **Regra:** `express-check-csurf-middleware-usage`
- **Severidade original:** INFO
- **Arquivo:** `src/app.js`
- **Classificação:** não aplicável à arquitetura atual.
- **Análise:** a aplicação disponibiliza endpoints públicos, sem autenticação, cookies de sessão ou persistência de dados associada a usuários. O endpoint `POST /api/answer` valida uma resposta e não modifica dados persistentes.
- **Tratamento:** supressão pontual e documentada com `nosemgrep`.
- **Risco residual:** se forem adicionados login, sessões autenticadas ou operações sensíveis, será necessário reavaliar a proteção CSRF.
- **Situação:** justificado e documentado.

## 3. Achados na imagem Docker - Trivy

### Achado 03: Dependências vulneráveis na imagem

- **Ferramenta:** Trivy
- **Severidade:** HIGH
- **Componentes envolvidos:** dependências distribuídas com o npm, incluindo `brace-expansion` e `undici`.
- **Problema:** a imagem continha componentes com vulnerabilidades corrigíveis, identificados durante a análise de segurança da imagem.
- **Impacto:** o quality gate bloqueou a continuidade da pipeline.
- **Correção:** ajuste do Dockerfile para utilizar uma construção em múltiplos estágios, instalar apenas as dependências necessárias em produção e remover o npm da imagem final, já que a aplicação é iniciada diretamente pelo Node.js.
- **Validação:** a análise posterior da imagem passou pelo quality gate, permitindo a continuidade da pipeline.
- **Situação:** corrigido no escopo da imagem de produção.

**Evidência de bloqueio:** https://github.com/EMB08/cyberquiz-devsecops/actions/runs/41245636912

**Evidência de correção:** https://github.com/EMB08/cyberquiz-devsecops/actions/runs/41334618244

A remoção do npm da imagem final reduz a superfície de ataque, mas não elimina a necessidade de acompanhar futuras vulnerabilidades da imagem base e das dependências de produção.

## 4. Achados DAST - OWASP ZAP

### Achado 04: Cabeçalhos de segurança HTTP

- **Ferramenta:** OWASP ZAP Baseline
- **Problema:** a análise dinâmica identificou alertas relacionados a configurações de segurança HTTP.
- **Correção aplicada:** inclusão do middleware Helmet para configurar cabeçalhos de segurança na aplicação Express.
- **Resultado:** redução dos tipos de alertas identificados pelo ZAP.
- **Situação:** parcialmente mitigado, com alertas residuais documentados.

### Alertas residuais

A análise posterior ainda apresentou avisos relacionados a políticas e cabeçalhos de segurança, incluindo configurações de Content Security Policy (CSP), uso de `unsafe-inline`, Cross-Origin-Embedder-Policy e Permissions-Policy.

Esses alertas foram mantidos como riscos residuais para avaliação futura. A pipeline utiliza o ZAP em modo informativo, preservando o relatório para análise sem bloquear automaticamente o deploy.

**Importante:** um job DAST concluído com sucesso significa que a análise foi executada conforme a configuração definida. Não significa que a aplicação esteja livre de alertas ou vulnerabilidades.

## 5. Controles adicionais implementados

- **Detecção de segredos:** Gitleaks integrado à pipeline.
- **Análise estática:** Semgrep executado automaticamente.
- **Análise de dependências:** Trivy aplicado ao projeto.
- **Análise de imagem:** Trivy com quality gate para vulnerabilidades HIGH/CRITICAL corrigíveis.
- **Segurança HTTP:** Helmet integrado ao Express.
- **Contêiner:** imagem de produção reduzida e execução com usuário não root.
- **Supply chain:** ações do GitHub referenciadas por SHAs completos.
- **Rastreabilidade:** imagem identificada por commit e digest SHA-256.
- **Produção:** aprovação humana obrigatória e verificação de health check.
- **Auditoria:** relatórios publicados como artifacts e resumo consolidado da esteira.

## 6. Evidências de funcionamento

| Evidência | Referência |
|---|---|
| Pipeline com nove jobs verdes | https://github.com/EMB08/cyberquiz-devsecops/actions/runs/41334618244 |
| Quality gate bloqueado | https://github.com/EMB08/cyberquiz-devsecops/actions/runs/41245636912 |
| Resumo consolidado | https://github.com/EMB08/cyberquiz-devsecops/actions/runs/41334618244/artifacts/13094676897 |
| Aplicação em produção | https://cyberquiz-devsecops.onrender.com |

## 7. Lições aprendidas

1. **Segurança deve fazer parte do processo de desenvolvimento.** A integração de scanners à pipeline permite identificar problemas antes da implantação em produção.

2. **Quality gates precisam bloquear problemas relevantes.** A falha detectada pelo Trivy demonstrou que um controle automatizado pode impedir a publicação de uma imagem com vulnerabilidades corrigíveis.

3. **Nem todo alerta representa uma vulnerabilidade explorável no contexto da aplicação.** O caso CSRF mostrou a importância de avaliar a arquitetura antes de classificar e tratar um achado.

4. **Reduzir a superfície de ataque melhora a segurança dos contêineres.** A remoção de componentes desnecessários da imagem final contribuiu para eliminar vulnerabilidades identificadas.

5. **Aprovação humana acrescenta uma camada de controle ao deploy.** A separação entre validação automatizada e autorização para produção permite revisar a implantação antes de sua execução.

6. **Relatórios e evidências são parte essencial de DevSecOps.** Artifacts, resumos e registros de execuções com falhas e sucessos tornam o processo verificável e auditável.

7. **Automação não elimina a necessidade de análise humana.** Os avisos residuais do OWASP ZAP demonstram que resultados de ferramentas precisam ser interpretados e priorizados conforme o risco.

## 8. Melhorias futuras

- Revisar e fortalecer a política CSP, reduzindo o uso de diretivas permissivas quando tecnicamente viável.
- Avaliar a adoção de Permissions-Policy e Cross-Origin-Embedder-Policy conforme as necessidades do frontend.
- Atualizar periodicamente dependências e imagem base.
- Reavaliar a necessidade de proteção CSRF caso a arquitetura passe a incluir autenticação ou operações sensíveis.
- Revisar os relatórios DAST e os riscos residuais em novas versões da aplicação.
