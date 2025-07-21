# ──────────────────────────────────────────────────────────────
# Single image that serves BOTH Flask (port 5000) and
# Telegram webhook (port 8000) behind Nginx (port 80).
# Vercel only needs one Dockerfile at the repo root.
# ──────────────────────────────────────────────────────────────
FROM python:3.11-slim AS base

ENV PYTHONUNBUFFERED=1
WORKDIR /app

# System libs for building some wheels
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential libssl-dev curl && \
    rm -rf /var/lib/apt/lists/*

# -----------------  install Python deps  --------------------
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt gunicorn python-telegram-bot==20.8

# -----------------  copy source code  -----------------------
COPY . .

# -----------------  Nginx  ----------------------------------
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*
COPY nginx.conf /etc/nginx/nginx.conf

# Create an unprivileged user
RUN useradd -m runner
USER runner

# Expose ONLY the port Vercel expects (8080 -> remapped to 80)
EXPOSE 8080

# -----------------  Entrypoint  -----------------------------
# 1.  start gunicorn (Flask app) on :5000
# 2.  start telegram_webhook (FastAPI/Flask) on :8000
# 3.  start nginx in foreground on :8080 and proxy / -> 5000, /telegram -> 8000
CMD ["/bin/sh", "-c", "\
  gunicorn --bind 0.0.0.0:5000 app:app & \
  python telegram_webhook.py & \
  nginx -g 'daemon off;' \
"]
