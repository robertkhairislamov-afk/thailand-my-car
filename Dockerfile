# Build stage - Landing
FROM node:20-alpine AS landing-builder

WORKDIR /app/landing

# Copy landing package files
COPY landing/package*.json ./

# Install dependencies
RUN npm ci

# Copy landing source code
COPY landing/ .

# Build the landing
RUN npm run build

# Build stage - Platform (Thailand My Car)
FROM node:20-alpine AS platform-builder

WORKDIR /app/platform

# Copy platform package files
COPY package*.json ./

# Install dependencies (use npm install to allow new packages)
RUN npm install --legacy-peer-deps

# Copy platform source code
COPY . .

# Remove landing folder (already built separately)
RUN rm -rf landing

# Build the platform (mainnet)
RUN npm run build

# Build the platform (testnet)
RUN npx vite build --config vite.config.testnet.ts

# Production stage
FROM nginx:alpine

# Copy landing built files to root
COPY --from=landing-builder /app/landing/build /usr/share/nginx/html

# Copy platform built files to /thailand-my-car
COPY --from=platform-builder /app/platform/build /usr/share/nginx/html/thailand-my-car

# Copy testnet built files to /thailand-my-car_testnet
COPY --from=platform-builder /app/platform/build-testnet /usr/share/nginx/html/thailand-my-car_testnet

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
