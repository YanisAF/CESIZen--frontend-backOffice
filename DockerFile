FROM node:20-bullseye

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le projet
COPY . .

# Exposer le port Vite
EXPOSE 5173

# Lancer Vite en dev
CMD ["npm", "run", "dev", "--", "--mode", "docker", "--host", "0.0.0.0"]