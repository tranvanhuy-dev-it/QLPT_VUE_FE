# Stage 1: Build the Vue 3 application
FROM node:22-alpine AS build
WORKDIR /app

# Copy dependency files to take advantage of Docker cache
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Define build-time arguments (Vite processes these variables at build-time)
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID

# Set environment variables for Vite
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Copy all source files and build
COPY . .
RUN npm run build

# Stage 2: Serve application with Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
