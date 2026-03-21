# Build stage
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage (using lightweight Nginx server)
FROM nginx:alpine

# Copy the built assets from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Configure Nginx to serve the Single Page Application (React)
# It routes all missing paths to index.html so React Router handles the navigation
RUN echo "server { \
    listen 8080; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

# Cloud Run injects $PORT environment variable, default is 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
