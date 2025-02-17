// Import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // Tambahkan CORS
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Inisialisasi Express dan Prisma
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

// Pastikan JWT_SECRET ada
if (!JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET tidak ditemukan di .env! Harap tambahkan dan restart server.');
  process.exit(1);
}

// Middleware
app.use(cors({ origin: '*', credentials: true })); // Mengizinkan akses dari frontend
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));

// ✅ Middleware untuk Logging Request
app.use((req, res, next) => {
  console.log(`📩 [${req.method}] ${req.url} - ${new Date().toISOString()}`);
  next();
});

// ✅ Fungsi untuk Generate JWT
const generateToken = (id, username) => {
  return jwt.sign({ id, username }, JWT_SECRET, { expiresIn: '1h' });
};

// ✅ Middleware untuk Verifikasi Token JWT
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.username = decoded.username;
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    res.clearCookie('token');
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// ✅ Endpoint: Registrasi
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  console.log('🔹 Incoming registration request:', username);

  // Validasi input
  if (!username || !password) {
    console.log('❌ ERROR: Username atau password kosong');
    return res.status(400).json({ message: 'Username dan password harus diisi' });
  }

  if (password.length < 6) {
    console.log('❌ ERROR: Password kurang dari 6 karakter');
    return res.status(400).json({ message: 'Password minimal 6 karakter' });
  }

  try {
    // Cek apakah username sudah digunakan
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      console.log('⚠️ Username sudah terdaftar:', username);
      return res.status(400).json({ message: 'Username sudah digunakan!' });
    }

    // Hash password sebelum disimpan ke database
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { username, password: hashedPassword },
    });

    console.log('✅ User berhasil didaftarkan:', newUser);
    res.json({ message: 'Registrasi berhasil!' });
  } catch (err) {
    console.error('❌ ERROR saat registrasi:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// ✅ Endpoint: Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('🔹 Incoming login request:', username);

  // Validasi input
  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password harus diisi' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      console.log('⚠️ Username tidak ditemukan:', username);
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    // Bandingkan password yang di-hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log('⚠️ Password salah untuk:', username);
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    // Generate token
    const token = generateToken(user.id, username);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    console.log('✅ Login berhasil untuk:', username);
    res.json({ message: 'Login berhasil!', token, user });
  } catch (err) {
    console.error('❌ ERROR saat login:', err.message);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// ✅ Endpoint: Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Berhasil logout!' });
});

// ✅ Endpoint: Dashboard Access
app.get('/api/dashboard', verifyToken, (req, res) => {
  res.json({ message: `Selamat datang, ${req.username}!` });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(500).json({ message: 'Terjadi kesalahan server' });
});

// ✅ Jalankan server dan pastikan database siap digunakan
async function startServer() {
  try {
    console.log('🔄 Mengecek koneksi database...');
    await prisma.$connect();
    console.log('✅ Database terhubung dengan sukses.');

    app.listen(PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Gagal menghubungkan ke database:', err.message);
    process.exit(1);
  }
}

startServer();
