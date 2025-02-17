# 1. Base image
FROM node:18-alpine

# 2. Tentukan direktori kerja di dalam container
WORKDIR /app

# 3. Salin file package.json dan package-lock.json
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Salin seluruh kode (folder prisma, src, dsb) ke dalam container
COPY . .

# 6. (Opsional) Generate Prisma Client, jika pakai Prisma
RUN npx prisma generate

# 7. (Opsional) Jika pakai TypeScript, jalankan build
# RUN npm run build

# 8. Expose port yang dipakai aplikasi (misal 3000)
EXPOSE 3000

# 9. Jalankan aplikasi
CMD ["npm", "run", "start"]
