# Base image
FROM node:18-alpine

# Install FFmpeg for RTSP streaming
RUN apk add --no-cache ffmpeg

# Set working directory
WORKDIR /app

# Copy only package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy the rest of the app source code
COPY . .

# Expose the server port
EXPOSE 8066

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8066/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Default command (development)
CMD ["npm", "run", "dev"]