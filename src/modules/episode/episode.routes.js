import express from 'express';
const router = express.Router();

import * as episodeController from './episode.controller.js';
import isAuthenticated from '../../middlewares/auth.js';
import multer from 'multer';

//Configuração do multer - armazena o áudio em memória temporariamente
//Em produção seria trocado por armazenamento em diso ou nuvem
const upload = multer({ storage: multer.memoryStorage() });

//Exibe formulário (somente usuários autenticados)
router.get('/upload', isAuthenticated, episodeController.getUploadForm);

//Processa o envio do episódio (somente usuários autenticados)
router.post( 
    '/upload',
    isAuthenticated,
    upload.fields([{ name: 'audio', maxCount: 1 }]), //espera um campo "audio" com no máximo 1 arquivo
    episodeController.upload
);

//Lista todos os episódios
router.get('/episodes', episodeController.list);

//Exibe um episódio específico
router.get('/episodes/:id', episodeController.show);

//Registra uma reprodução
router.post('/episodes/:id/play', episodeController.play);

//Delete um episódio (somente usuários autenticados)
router.delete('/episodes/:id', isAuthenticated, episodeController.delete);

export default router;