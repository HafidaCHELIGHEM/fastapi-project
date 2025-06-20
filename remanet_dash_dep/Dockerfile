# Étape 1 : build
FROM node:18-alpine AS builder

WORKDIR /app

# Copier uniquement les fichiers package.json et package-lock.json (pour le cache)
COPY package*.json ./

RUN npm install

# Copier tout le code source (pages, components, public, etc.)
COPY . .

RUN npm run build

# Étape 2 : production
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Copier les fichiers buildés et node_modules du builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]