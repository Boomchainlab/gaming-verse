# ──────────────────────────────────────────────────────────────
# Flask API (5000) + Telegram Webhook (8000) behind Nginx (8080)
# Single Dockerfile for Vercel — no external nginx.conf needed
# ──────────────────────────────────────────────────────────────
FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1
WORKDIR /app

# 1. Install system + Python deps + Nginx
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libssl-dev curl nginx && \
    rm -rf /var/lib/apt/lists/*

# 2. Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt gunicorn python-telegram-bot==20.8

# 3. Copy all app source
COPY . .

# 4. Inline Nginx configuration
RUN printf '%s\n' \
    'worker_processes 1;' \
    'events { worker_connections 1024; }' \
    'http {' \
    '  include       mime.types;' \
    '  default_type  application/octet-stream;' \
    '  sendfile        on;' \
    '  server {' \
    '    listen 8080;' \
    '    location / {' \
    '      proxy_pass http://127.0.0.1:5000;' \
    '      proxy_set_header Host $host;' \
    '      proxy_set_header X-Real-IP $remote_addr;' \
    '    }' \
    '    location /telegram {' \
    '      proxy_pass http://127.0.0.1:8000;' \
    '      proxy_set_header Host $host;' \
    '      proxy_set_header X-Real-IP $remote_addr;' \
    '    }' \
    '  }' \
    '}' > /etc/nginx/nginx.conf

# 5. Use non-root user for security
RUN useradd -m runner
USER runner

# 6. Vercel exposes port 8080
EXPOSE 8080

# 7. Start Flask (port 5000), Telegram (8000), and Nginx (8080)
CMD ["/bin/sh", "-c", "\
  gunicorn --bind 0.0.0.0:5000 app:app & \
  python telegram_webhook.py & \
  nginx -g 'daemon off;' \
"]
