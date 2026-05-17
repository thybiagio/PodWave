import express from 'express';
const router = express.Router();

import * as userController from '.user/controller.js';

//GET /register -> mostra formulário
router.get('/register', (req, res) => {
    res.render('register', { title: 'Criar Conta' });
});

//POST /register -> processa cadastro
router.post('/register', userController.register);

export default router;