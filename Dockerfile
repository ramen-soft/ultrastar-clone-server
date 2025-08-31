FROM node:20-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY pnpm-lock.yaml ./
COPY package*.json ./

RUN pnpm install

COPY . .

CMD ["pnpm", "run", "dev", "--host"]