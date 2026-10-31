
# Etapa 1: instalar dependencias de producao
FROM node:24-alpine AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev && npm cache clean --force


# Etapa 2: imagem de producao
FROM node:24-alpine

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# O npm e o node-gyp nao sao necessarios em tempo de execucao.
# Removemos essas ferramentas da imagem final para reduzir
# a superficie de ataque e eliminar dependencias vulneraveis.
USER root

RUN rm -rf /usr/local/lib/node_modules/npm \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx

COPY --from=dependencies /app/node_modules ./node_modules

COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src

USER node

EXPOSE 3000

CMD ["node", "src/server.js"]
