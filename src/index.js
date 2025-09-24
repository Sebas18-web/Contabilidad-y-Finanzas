import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configuración de ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta web
app.use(express.static(path.join(__dirname, 'web')));

// Configurar rutas y funcionalidades
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web', 'index.html'));
});

// Manejador de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Algo salió mal en el servidor',
        mensaje: err.message 
    });
});

// Ruta para manejar páginas no encontradas
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Página no encontrada',
        ruta: req.originalUrl 
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor de contabilidad ejecutándose en http://localhost:${PORT}`);
    console.log('Presiona Ctrl+C para detener el servidor');
});

export default app;