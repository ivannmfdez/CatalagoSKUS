const express = require('express');
const mysql = require('mysql2');
const http = require('http');
const socketIo = require('socket.io');

// Configura la app Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Conexión a la base de datos MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Reemplaza con tu usuario
  password: 'password',  // Reemplaza con tu contraseña
  database: 'inventario_sku'
});

connection.connect(err => {
  if (err) throw err;
  console.log('Conectado a MySQL');
});

// Servir archivos estáticos (para frontend)
app.use(express.static('public'));

// Ruta para obtener productos
app.get('/productos', (req, res) => {
  connection.query('SELECT * FROM productos', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Conexión a WebSockets
io.on('connection', (socket) => {
  console.log('Usuario conectado');

  // Enviar actualización en tiempo real
  socket.on('actualizar_producto', (productoActualizado) => {
    connection.query('UPDATE productos SET cantidad = ?, ubicacion = ? WHERE sku = ?', 
      [productoActualizado.cantidad, productoActualizado.ubicacion, productoActualizado.sku],
      (err) => {
        if (err) throw err;
        io.emit('producto_actualizado', productoActualizado);
      });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
