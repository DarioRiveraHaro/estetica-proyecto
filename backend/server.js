const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Configurar SQLite
const db = new sqlite3.Database('./db/database.sqlite', (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conectado a la base de datos SQLite');
  }
});

// Crear tabla de clientes si no existe
db.run(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clienteId TEXT UNIQUE,
    visitas INTEGER DEFAULT 0
  )
`);

// Ruta para registrar escaneos
app.post('/api/escaneo', (req, res) => {
  const { clienteId } = req.body;

  db.get('SELECT * FROM clientes WHERE clienteId = ?', [clienteId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (row) {
      // Si el cliente ya existe, incrementar visitas
      db.run('UPDATE clientes SET visitas = visitas + 1 WHERE clienteId = ?', [clienteId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error al actualizar visitas' });
        }
        res.json({ visitas: row.visitas + 1 });
      });
    } else {
      // Si el cliente no existe, crear un nuevo registro
      db.run('INSERT INTO clientes (clienteId, visitas) VALUES (?, 1)', [clienteId], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error al crear cliente' });
        }
        res.json({ visitas: 1 });
      });
    }
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});