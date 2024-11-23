const express = require('express');
const router = express.Router();
const db = require('../database/db'); // Import the database connection

// Endpoint for getting all petugas
router.get('/', (req, res) => {
    db.query('SELECT * FROM petugas', (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        res.json(results);
    });
});

// Endpoint for getting petugas by ID
router.get('/:id', (req, res) => {
    db.query('SELECT * FROM petugas WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.length === 0) return res.status(404).send('Petugas not found');
        res.json(results[0]);
    });
});

// Endpoint for adding a new petugas
router.post('/', (req, res) => {
    const { nama, jabatan } = req.body;
    if (!nama || !jabatan || nama.trim() === '' || jabatan.trim() === '') {
        return res.status(400).send('All fields are required');
    }

    db.query(
        'INSERT INTO petugas (nama, jabatan) VALUES (?, ?)',
        [nama.trim(), jabatan.trim()],
        (err, results) => {
            if (err) return res.status(500).send('Internal Server Error');
            const newPetugas = {
                id: results.insertId,
                nama: nama.trim(),
                jabatan: jabatan.trim(),
            };
            res.status(201).json(newPetugas);
        }
    );
});

// Endpoint for updating petugas data
router.put('/:id', (req, res) => {
    const { nama, jabatan } = req.body;
    db.query(
        'UPDATE petugas SET nama = ?, jabatan = ? WHERE id = ?',
        [nama, jabatan, req.params.id],
        (err, results) => {
            if (err) return res.status(500).send('Internal Server Error');
            if (results.affectedRows === 0) return res.status(404).send('Petugas not found');
            res.json({ id: req.params.id, nama, jabatan });
        }
    );
});

// Endpoint for deleting petugas
router.delete('/:id', (req, res) => {
    db.query('DELETE FROM petugas WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).send('Internal Server Error');
        if (results.affectedRows === 0) return res.status(404).send('Petugas not found');
        res.status(204).send();
    });
});

module.exports = router;
