FROM node:22-alpine3.21

WORKDIR /app

# Set environment variables
RUN apk update && apk add --no-cache g++ gcc python3 openjdk17 
COPY package*.json ./
ENV CORS_ORIGIN=https://codejudge.jaindevshrut.me,https://backend.jaindevshrut.me
RUN npm install
COPY . .
ENV PORT=8080
ENV JWT_SECRET=qvB6ZAxKD3q1q4s5sL0XTSNsCzmL2v6lWjxYZ93m1wZEMjCHFlff6HXlZwEXtVRV


EXPOSE 8080

CMD ["node", "index.js"]