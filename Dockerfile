FROM node:22-alpine3.20
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install dependencies first (this layer will be cached)
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
RUN pnpm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npx prisma generate
RUN pnpm run build

EXPOSE 3000
CMD ["pnpm", "run", "start"] 