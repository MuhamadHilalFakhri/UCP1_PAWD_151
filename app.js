const express = require('express');
const app = express();
require('dotenv').config();

const port = process.env.PORT;
const db = require('./database/db');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const pasienRoutes = require('./routes/pasien.js');
const petugasRoutes = require('./routes/petugas.js'); // Mengimpor route pasien
const { isAuthenticated } = require('./middlewares/middleware.js');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressLayouts);

// Konfigurasi express-session
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }, // Ganti menjadi true jika menggunakan HTTPS
    })
);

// Menggunakan routes
app.use('/', authRoutes);
app.use('/pasien', pasienRoutes);
app.use('/petugas', petugasRoutes); // Menghubungkan pasien.js ke /pasien

// Set view engine
app.set('view engine', 'ejs');

// Halaman utama
app.get('/', isAuthenticated, (req, res) => {
    res.render('index', {
        layout: 'layouts/main-layout',
    });
});

// Halaman pasien-view (tampilkan daftar pasien)
app.get('/pasien-view', isAuthenticated, (req, res) => {
    db.query('SELECT * FROM pasien', (err, pasien) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.render('pasien', {
            layout: 'layouts/main-layout',
            pasien: pasien,
        });
    });
});

// Endpoint untuk menangani edit pasien tanpa PUT
app.post('/pasien/update', isAuthenticated, (req, res) => {
    const { id, nama, keluhan } = req.body;

    // Validating the input
    if (!id || !nama || !keluhan) {
        return res.status(400).send('Semua field wajib diisi');
    }

    // Query untuk update data pasien
    db.query(
        'UPDATE pasien SET nama = ?, keluhan = ? WHERE id = ?',
        [nama, keluhan, id],
        (err, results) => {
            if (err) return res.status(500).send('Internal Server Error');
            res.redirect('/pasien-view'); // Setelah update, kembali ke halaman pasien
        }
    );
});



// Endpoint untuk menangani hapus pasien tanpa DELETE
app.post('/pasien/delete', isAuthenticated, (req, res) => {
    const { id } = req.body;

    db.query('DELETE FROM pasien WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.redirect('/pasien-view'); // Kembali ke halaman pasien
    });
});

app.post('/pasien', isAuthenticated, (req, res) => {
    const { nama, keluhan } = req.body;

    db.query(
        'INSERT INTO pasien (nama, keluhan) VALUES (?, ?)',
        [nama, keluhan],
        (err) => {
            if (err) return res.status(500).send('Internal Server Error');
            res.redirect('/pasien-view'); // Kembali ke halaman pasien
        }
    );
});

app.post('/pasien', isAuthenticated, (req, res) => {
    const { nama, keluhan } = req.body;

    // Validate input
    if (!nama || !keluhan) {
        return res.status(400).send('Semua field wajib diisi');
    }

    // Insert data into the database
    db.query(
        'INSERT INTO pasien (nama, keluhan) VALUES (?, ?)',
        [nama, keluhan],
        (err, results) => {
            if (err) return res.status(500).send('Internal Server Error');

            // Respond with the newly added patient data
            const newPasien = {
                id: results.insertId,
                nama: nama,
                keluhan: keluhan
            };
            res.status(201).json(newPasien); // Send the new patient data back as JSON
        }
    );
});

// Menampilkan daftar petugas
app.get('/petugas-view', isAuthenticated, (req, res) => {
    db.query('SELECT * FROM petugas', (err, petugas) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.render('petugas', {
            layout: 'layouts/main-layout',
            petugas: petugas,
        });
    });
});

// Endpoint untuk menangani update data petugas tanpa PUT
app.post('/petugas/update', isAuthenticated, (req, res) => {
    const { id, nama, jabatan } = req.body;

    // Validasi input
    if (!id || !nama || !jabatan) {
        return res.status(400).send('Semua field wajib diisi');
    }

    // Query untuk update data petugas
    db.query(
        'UPDATE petugas SET nama = ?, jabatan = ? WHERE id = ?',
        [nama, jabatan, id],
        (err, results) => {
            if (err) return res.status(500).send('Internal Server Error');
            res.redirect('/petugas-view'); // Setelah update, kembali ke halaman petugas
        }
    );
});
// Endpoint untuk menangani hapus petugas tanpa DELETE
app.post('/petugas/delete', isAuthenticated, (req, res) => {
    const { id } = req.body;

    db.query('DELETE FROM petugas WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.redirect('/petugas-view'); // Kembali ke halaman petugas
    });
});
// Endpoint untuk menambahkan petugas baru
// Endpoint untuk menambahkan petugas baru
app.post('/petugas', isAuthenticated, (req, res) => {
    const { nama, jabatan } = req.body;

    // Validasi input
    if (!nama || !jabatan) {
        return res.status(400).send('Semua field wajib diisi');
    }

    // Insert data petugas ke dalam database
    db.query(
        'INSERT INTO petugas (nama, jabatan) VALUES (?, ?)',
        [nama, jabatan],
        (err, results) => {
            if (err) {
                console.error(err); // Log error untuk melihat masalah lebih lanjut
                return res.status(500).send('Internal Server Error');
            }

            // Mengirim data petugas yang baru ditambahkan
            const newPetugas = {
                id: results.insertId,
                nama: nama,
                jabatan: jabatan
            };
            res.status(201).json(newPetugas); // Mengirim data petugas baru dalam format JSON
        }
    );
});



// Jalankan server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
