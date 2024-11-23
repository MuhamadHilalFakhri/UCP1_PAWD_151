const express = require('express');
const router = express.Router();
const db = require('../database/db'); // Mengimpor koneksi database

// Endpoint untuk mendapatkan semua data pasien
router.get('/', (req, res) => {
    db.query('SELECT * FROM pasien', (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.json(results);
    });
});

// Endpoint untuk mendapatkan data pasien berdasarkan ID
router.get('/:id', (req, res) => {
    db.query('SELECT * FROM pasien WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.length === 0) return res.status(404).send('Data pasien tidak ditemukan');
        res.json(results[0]);
    });
});

// Endpoint untuk menambahkan data pasien baru
router.post('/', (req, res) => {
    const { nama, keluhan } = req.body;
    if (!nama || !keluhan || nama.trim() === '' || keluhan.trim() === '') {
        return res.status(400).send('Semua field wajib diisi');
    }

    db.query(
        'INSERT INTO pasien (nama, keluhan) VALUES (?, ?)',
        [nama.trim(), keluhan.trim()],
        (err, results) => {
            if (err) return res.status(500).send('Internal Server Error');
            const newPasien = {
                id: results.insertId,
                nama: nama.trim(),
                keluhan: keluhan.trim(),
            };
            res.status(201).json(newPasien);
        }
    );
});


// Endpoint untuk memperbarui data pasien
router.put('/:id', (req, res) => {
    const { nama, keluhan } = req.body;

    db.query(
        'UPDATE pasien SET nama = ?, keluhan = ? WHERE id = ?',
        [nama, keluhan, req.params.id],
        (err, results) => {
            if (err) return res.status(500).send('Internal Server Error');
            if (results.affectedRows === 0) return res.status(404).send('Data pasien tidak ditemukan');
            res.json({ id: req.params.id, nama, keluhan });
        }
    );
});

// Endpoint untuk menghapus data pasien
router.delete('/:id', (req, res) => {
    db.query('DELETE FROM pasien WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.affectedRows === 0) return res.status(404).send('Data pasien tidak ditemukan');
        res.status(204).send();
    });
});

module.exports = router;
