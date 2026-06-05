import express from 'express';
const router = express.Router();

import * as userController from './user.controller.js';
import isAuthenticated from '../../middlewares/auth.js';
import * as episodeService from '../episode/episode.service.js';
import Episode from '../episode/episode.model.js';

router.get('/register', (req, res) => {
    res.render('register', { title: 'Criar Conta' });
});

router.get('/login', (req, res) => {
    res.render('login', { title: 'Entrar' });
});

router.post('/login', userController.login);
router.post('/register', userController.register);

router.get('/logout', isAuthenticated, userController.logout);

router.get('/feed', isAuthenticated, async (req, res) => {
    try {
        const { category } = req.query;
        const episodes = await episodeService.listEpisodes(Episode, category || null);
        res.render('feed', { title: 'Feed | PodWave', episodes, category: category || null });
    } catch (error) {
        req.flash('error', error.message);
        res.render('feed', { title: 'Feed | PodWave', episodes: [], category: null });
    }
});

router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const episodes = await Episode.findAll({
            where: { userId: req.session.user.id },
            order: [['created_at', 'DESC']]
        });

        const totalPlays = episodes.reduce((sum, ep) => sum + (ep.plays || 0), 0);

        res.render('profile', {
            title: 'Meu Perfil | PodWave',
            episodes,
            totalPlays
        });
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/feed');
    }
});

export default router;