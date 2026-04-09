FROM node:18-slim

# Create non-root user
RUN groupadd -r staffhub && useradd -r -g staffhub staffhub

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy rest of the app
COPY . .

# Change ownership
RUN chown -R staffhub:staffhub /app

# Switch to non-root user
USER staffhub

# Expose port
EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start app
CMD ["node", "server.js"]