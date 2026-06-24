import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../../app.js';
import * as podcastService from '../podcast.service.js';

vi.mock('../podcast.service.js');
vi.mock('../podcast.model.js');
vi.mock('../../episode/episode.service.js');
vi.mock('../../episode/episode.model.js');
vi.mock('multer', () => {
    const multerMock = () => ({
        any: () => (req, res, next) => {
            req.files = [];
            next();
        }
    });
    multerMock.diskStorage = () => ({});
    return { default: multerMock };
});
vi.mock('express-session', () => ({
    default: () => (req, res, next) => {
        req.session = { user: { id: 1, username: 'testuser', role: 'user' } };
        next();
    }
}));

describe('Podcast Controller', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    //----Listar Podcasts----

    it('deve listar podcasts e retornar status 200', async () => {
        podcastService.listPodcasts.mockResolvedValueOnce([
            { id: 1, title: 'Tech Talks' }
        ]);

        const response = await request(app).get('/podcasts');

        expect(response.status).toBe(200);
    });

    //----Editar Podcast----

    it('deve redirecionar para /podcasts após editar com sucesso', async () => {
        podcastService.updatePodcast.mockResolvedValueOnce({
            message: 'Podcast atualizado com sucesso!'
        });

        const response = await request(app)
            .post('/podcasts/1/edit')
            .send({ title: 'Tech Talks Atualizado' });

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/podcasts');
    });

    it('deve redirecionar para /podcasts/:id/edit em caso de erro na edição', async () => {
        podcastService.updatePodcast.mockRejectedValueOnce(
            new Error('Você não tem permissão para editar este podcast')
        );

        const response = await request(app)
            .post('/podcasts/1/edit')
            .send({ title: '' });

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/podcasts/1/edit');
    });

    //----Exibir Podcast----

    it('deve exibir um podcast e retornar status 200', async () => {
        podcastService.getPodcastById.mockResolvedValueOnce({
            id: 1, title: 'Tech Talks', userId: 1
        });

        const episodeService = await import('../../episode/episode.service.js');
        episodeService.listEpisodes.mockResolvedValueOnce([]);

        const response = await request(app).get('/podcasts/1');

        expect(response.status).toBe(200);
    });

    it('deve redirecionar para /podcasts se podcast não for encontrado', async () => {
        podcastService.getPodcastById.mockRejectedValueOnce(
            new Error('Podcast não encontrado')
        );

        const response = await request(app).get('/podcasts/999');

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/podcasts');
    });

    //----Deletar Podcast----

    it('deve redirecionar para /podcasts após deletar com sucesso', async () => { 
        podcastService.deletePodcast.mockResolvedValueOnce({ 
            message: 'Podcast deletado com sucesso!'
        });

        const response = await request(app)
            .post('/podcasts/1/delete');

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/podcasts');
    });

    it('deve redirecionar para /podcasts em caso de erro ao deletar', async() => { 
        podcastService.deletePodcast.mockRejectedValueOnce(
            new Error('Você não tem permissão para deletar este podcast')
        );

        const response = await request(app)
            .post('/podcasts/1/delete');

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/podcasts');
    });

    //----Formulários----

    it('deve exibir formulário de criação e retornar status 200', async () => { 
        const response = await request(app).get('/podcasts/new');

        expect(response.status).toBe(200);
    });

    it('deve exibir formulário de edição e retornar status 200', async () => { 
        podcastService.getPodcastById.mockResolvedValueOnce({ 
            id: 1, title: 'Tech Talks', userId: 1
        });

        const response = await request(app).get('/podcasts/1/edit');

        expect(response.status).toBe(200);
    });

    //----Meus Podcasts----

    it('deve listar meus podcasts e retornar status 200', async () => { 
        podcastService.listPodcasts.mockResolvedValueOnce([
            { id: 1, title: 'Tech Talks', userId: 1 }
        ]);

        const response = await request(app).get('/podcasts/mine');

        expect(response.status).toBe(200);
    });
});