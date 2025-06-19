# Base image হিসেবে Node.js 20 ব্যবহার করছি
FROM node:20-alpine

# Working directory সেট করছি
WORKDIR /app

# package.json এবং package-lock.json কপি করে dependency install করবো
COPY package*.json ./

# Dependencies install
RUN npm install

# Grunt এবং grunt-nodemon এর devDependencies install নিশ্চিত করবো
RUN npm install grunt grunt-nodemon --save-dev

# বাকি সব সোর্স কোড কপি করবো
COPY . .

# start.sh executable বানানো হচ্ছে
RUN chmod +x start.sh

# Environment variables external ভাবে দেবো (Docker run বা Compose এ)
# Container run করার সময় এই কমান্ড ব্যবহার করো
# CMD ["bash", "start.sh"]

CMD ["npm", "run", "start"]
