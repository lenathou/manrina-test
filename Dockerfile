FROM node:22-alpine3.20
WORKDIR /app

# Install dependencies first (this layer will be cached)
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"] 