
#!/bin/bash

echo "🔄 Installing dependencies..."
npm install

echo "🌐 Starting Grok tunnel..."
grok http 3000 > grok.log &

sleep 3
TUNNEL_URL=$(grep -o 'https://[^ ]*.trygrok.io' grok.log | head -n1)
echo "🌐 Grok Tunnel URL: $TUNNEL_URL"

export PUBLIC_URL="$TUNNEL_URL"

echo "🚀 Starting Goat Bot..."
node index.js
