# Multi-stage Dockerfile for Angular frontend
# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration production

# Runtime stage (Railway-friendly: binds to $PORT)
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

RUN npm install -g serve@14.2.4

COPY --from=build /app/dist/humancare-ui/browser ./dist

EXPOSE 8080
CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
