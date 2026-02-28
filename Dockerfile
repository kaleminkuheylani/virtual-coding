# Virtual Coding IDE - Production Dockerfile
# Next.js 15 + WebSocket Terminal Server
# GitHub: kaleminkuheylani/virtual-coding

# ============================================
# STAGE 1: Builder - Build Dependencies
# ============================================
FROM oven/bun:1-debian AS builder

# Install build dependencies for native modules (node-pty)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    python3-dev \
    python3-venv \
    curl \
    ca-certificates \
    git \
    bash \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files for dependency caching
COPY package.json bun.lock ./

# Install all dependencies (including devDependencies for build)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build Next.js application
RUN bun run build

# ============================================
# STAGE 2: Production Runtime
# ============================================
FROM oven/bun:1-debian AS runtime

# Install runtime dependencies
# - bash: required for terminal shell
# - python3, python3-venv: for Python code execution
# - libc6, libstdc++6: required for node-pty native module
# - procps: for process management (ps, top)
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    python3 \
    python3-venv \
    python3-pip \
    libc6 \
    libstdc++6 \
    curl \
    ca-certificates \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Install uv for Python package management
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# Create workspace and cache directories with proper permissions
RUN mkdir -p /workspace /cache /opt/python-venv && \
    chmod 755 /workspace /cache

# Create Python virtual environment with useful packages
# Using absolute path to uv to avoid PATH issues
RUN /root/.local/bin/uv venv /opt/python-venv && \
    /root/.local/bin/uv pip install --python /opt/python-venv/bin/python \
    fastapi \
    uvicorn \
    flask \
    django \
    pandas \
    numpy \
    requests \
    pydantic \
    httpx \
    aiohttp \
    websockets \
    dnspython \
    beautifulsoup4

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/src/lib ./src/lib

# Copy only production node_modules (built native modules included)
COPY --from=builder /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production
ENV WORKSPACE_ROOT=/workspace
ENV PYTHON_PATH=/opt/python-venv/bin/python
ENV PATH="/root/.local/bin:${PATH}"

# Add Python venv to PATH for easy access
ENV PATH="/opt/python-venv/bin:${PATH}"

# Expose port
EXPOSE 3000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the server (Next.js + WebSocket terminal)
CMD ["bun", "run", "start"]
