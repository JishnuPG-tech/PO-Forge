FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for psycopg2 and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend source code, shared modules, and migrations
COPY backend /app/backend
COPY shared /app/shared
COPY poforge_prod.db /app/poforge_prod.db

ENV PYTHONPATH=/app
ENV PORT=8000
ENV ENVIRONMENT=production

EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
