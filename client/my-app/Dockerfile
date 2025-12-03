# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Expose port
EXPOSE 8060

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8060', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start dev server
CMD ["npm", "run", "dev", "--", "-p", "8060"]