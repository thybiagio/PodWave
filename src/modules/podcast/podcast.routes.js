import express from 'express';
const router = express.Router();

import * as podcastController from './podcast.controller.js';
import isAuthenticated from '../../middlewares/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const coverDir = path.resolve(
    __dirname,
    '../../public/uploads/covers'
);

if (!fs.existsSync(coverDir))
    fs.mkdirSync(coverDir, { recursive: true });

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

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

//Exibe formulário de criação 
router.get('/podcasts/new', isAuthenticated, podcastController.getCreateForm);

//Processa a criação do podcast 
router.post(
    '/podcasts',
    isAuthenticated,
    upload.any(),
    podcastController.create
);

//Lista todos os podcasts
router.get('/podcasts', podcastController.list);

//Lista os podcasts do usuário logado (somente usuários autenticados)
router.get('/podcasts/mine', isAuthenticated, podcastController.mine);

//Exibe formulário de edição 
router.get('/podcasts/:id/edit', isAuthenticated, podcastController.getEditForm);

//Processa a edição do podcast 
router.post('/podcasts/:id/edit', isAuthenticated, podcastController.update);

//Deleta um podcast 
router.post('/podcasts/:id/delete', isAuthenticated, podcastController.remove);

//Exibe um podcast específico (deve vir por último, senão captura "/podcasts/mine", "/podcasts/new" etc. como :id)
router.get('/podcasts/:id', podcastController.show);

export default router;