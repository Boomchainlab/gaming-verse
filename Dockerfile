# ──────────────────────────────────────────────────────────────
# Creator-Coin-Spin - Flask game container
# ──────────────────────────────────────────────────────────────
FROM python:3.11-slim

# Install build essentials for Python deps that need compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
      build-essential curl && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user for security
ENV USER=appuser
RUN useradd -m $USER
WORKDIR /home/$USER/app
COPY --chown=$USER:$USER . .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Make sure static assets are collected (if any)
ENV FLASK_ENV=production
ENV PORT=8000
EXPOSE 8000

# -- Gunicorn entrypoint
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
