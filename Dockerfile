FROM node:16

# Install system dependencies
RUN apt-get update && apt-get install -y \
  build-essential \
  libcairo2-dev \
  libpango1.0-dev \
  libjpeg-dev \
  libgif-dev \
  librsvg2-dev \
  python3 \
  curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

# ✅ FINAL FIX: Download working binary of Grok CLI (no unzip needed)
RUN curl -L https://github.com/hellogrok/grok/releases/latest/download/grok-linux-amd64 -o /usr/local/bin/grok && \
    chmod +x /usr/local/bin/grok

COPY . .

RUN chmod +x start.sh

EXPOSE 3000

CMD ["bash", "./start.sh"]
