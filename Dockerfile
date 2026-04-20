FROM node:18

WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy full project
COPY . .

EXPOSE 3000

CMD ["node", "backend/server.js"]