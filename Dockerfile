# ---- Base image ----
FROM node:22-slim

# Set workdir
WORKDIR /app

# Copy dependency manifests first (better caching)
COPY package*.json pnpm-lock.yaml* ./

# Install pnpm if you use pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm run build

# Start command
CMD ["node", "dist/index.cjs"]
