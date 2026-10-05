# ==========================
# Stage 1: Build
# ==========================
FROM node:20-alpine AS builder
WORKDIR /app

# Accept Vite env vars at build time and expose them to `vite build`
ARG VITE_BASE_URL

ENV VITE_BASE_URL=$VITE_BASE_URL

COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN npm run build

# ==========================
# Stage 2: Production
# ==========================
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
