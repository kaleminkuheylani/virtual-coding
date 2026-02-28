FROM oven/bun:1-debian

RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-venv python3-pip curl ca-certificates && rm -rf /var/lib/apt/lists/*

RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:${PATH}"

RUN mkdir -p /opt/node-modules /opt/python-venv /workspace /cache
WORKDIR /opt/node-modules
RUN bun add react vue svelte next typescript vite axios lodash-es date-fns zod tailwindcss
RUN uv venv /opt/python-venv && /opt/python-venv/bin/uv pip install fastapi uvicorn flask django pandas numpy requests pydantic openai anthropic

WORKDIR /app
COPY . .

ENV WORKSPACE_ROOT=/workspace
EXPOSE 3000 3001
CMD ["bun", "run", "dev"]
