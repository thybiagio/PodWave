import express from 'express';
const router = express.Router();

import * as episodeController from './episode.controller.js';
import isAuthenticated from '../../middlewares/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../../public/uploads/audios');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

//Exibe formulário (somente usuários autenticados)
router.get('/upload', isAuthenticated, episodeController.getUploadForm);

//Processa o envio do episódio (somente usuários autenticados)
router.post( 
    '/upload',
    isAuthenticated,
    upload.single('audio'), 
    episodeController.upload
);

//Lista todos os episódios
router.get('/episodes', episodeController.list);

//Exibe um episódio específico
router.get('/episodes/:id', episodeController.show);

//Registra uma reprodução
router.post('/episodes/:id/play', episodeController.play);

//Delete um episódio (somente usuários autenticados)
router.delete('/episodes/:id', isAuthenticated, episodeController.remove);

export default router;