# ---------- Stage 1: Build ----------
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
COPY . .
RUN npm install
RUN npm run build

# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy build output from Vite builder stage
COPY --from=builder /app/dist .

# Copy custom nginx config (optional, if added)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
