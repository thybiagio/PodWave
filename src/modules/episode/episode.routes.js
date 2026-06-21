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
const audioDir = path.resolve(
    __dirname,
    '../../public/uploads/audios'
);

const coverDir = path.resolve(
    __dirname,
    '../../public/uploads/covers'
);

if (!fs.existsSync(audioDir))
    fs.mkdirSync(audioDir, { recursive: true });

if (!fs.existsSync(coverDir))
    fs.mkdirSync(coverDir, { recursive: true });

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        if (file.fieldname === 'audio') {
            return cb(null, audioDir);
        }

        if (file.fieldname === 'cover') {
            return cb(null, coverDir);
        }

        cb(new Error('Campo inválido'));
    },

    filename: (req, file, cb) => {

        const unique =
            Date.now() +
            '-' +
            Math.round(Math.random() * 1e9);

        cb(
            null,
            unique + path.extname(file.originalname)
        );
    }
});

const upload = multer({ storage });

//Exibe formulário de novo episódio dentro de um podcast (somente usuários autenticados)
router.get('/podcasts/:podcastId/upload', isAuthenticated, episodeController.getUploadForm);

//Processa o envio do episódio dentro de um podcast (somente usuários autenticados)
router.post(
    '/podcasts/:podcastId/upload',
    isAuthenticated,
    upload.any(),
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