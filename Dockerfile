FROM oven/bun:1-debian

RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-venv curl ca-certificates && rm -rf /var/lib/apt/lists/*

RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:${PATH}"

RUN mkdir -p /opt/node-modules /opt/python-venv /workspace /cache
WORKDIR /opt/node-modules
RUN bun add react vue svelte next typescript vite axios lodash-es date-fns zod tailwindcss
RUN uv venv /opt/python-venv && uv pip install --python /opt/python-venv/bin/python fastapi uvicorn flask django pandas numpy requests pydantic openai anthropic

ENV NODE_PATH=/opt/node-modules/node_modules
ENV VIRTUAL_ENV=/opt/python-venv
ENV PATH="/opt/python-venv/bin:${PATH}"
ENV UV_CACHE_DIR=/cache/uv

WORKDIR /app
COPY . .
RUN bun install
RUN bun run build

ENV WORKSPACE_ROOT=/workspace
EXPOSE 3000
CMD ["bun", "run", "start"]
