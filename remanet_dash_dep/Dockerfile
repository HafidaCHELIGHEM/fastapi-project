# Étape 1 : build
FROM node:20-alpine AS build

WORKDIR /app

COPY remanet_dash_dep/package.json remanet_dash_dep/package-lock.json ./
RUN npm install

COPY remanet_dash_dep/ ./
RUN npm run build

# Étape 2 : production
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app ./

EXPOSE 3000

CMD ["npm", "start"]