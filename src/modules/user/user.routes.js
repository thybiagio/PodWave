import express from 'express';
const router = express.Router();

import * as userController from './user.controller.js';
import isAuthenticated from '../../middlewares/auth.js';

//GET /register -> mostra formulário
router.get('/register', (req, res) => {
    res.render('register', { title: 'Criar Conta' });
});

//GET /login -> mostra formulário
router.get('/login', (req, res) => {
    res.render('login', { title: 'Entrar' });
});

//POST /login -> processa login
router.post('/login', userController.login);

//GET /logout -> realiza logout
router.get('/logout', isAuthenticated, userController.logout);

// Rota protegida (exemplo) 
router.get('/feed', isAuthenticated, (req, res) => {
    res.render('feed', { title: 'Feed | PodWave' });
});


//POST /register -> processa cadastro
router.post('/register', userController.register);

export default router;