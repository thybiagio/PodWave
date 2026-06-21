import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as podcastService from '../podcast.service.js';

describe('Podcast Service', () => { 
    let mockPodcastModel;

    beforeEach(() => { 
        mockPodcastModel = { 
            create: vi.fn(),
            findAll: vi.fn(),
            findByPk: vi.fn(),
        };
    });

    it('deve lançar erro se o título estiver vazio', async () => { 
        const data = { title: '' };

        await expect( 
            podcastService.createPodcast(data, mockPodcastModel, 1)
        ).rejects.toThrow('Título é obrigatório');
    });

    it('deve lançar erro se o título ultrapassar 255 caracteres', async () => { 
        const data = { title: 'a' .repeat(256) };

        await expect( 
            podcastService.createPodcast(data, mockPodcastModel, 1)
        ).rejects.toThrow('Título não pode ultrapassar 255 caracteres');
    });

    it('deve lançar erro se o userId não for fornecido', async () => {
        const data = { title: 'Podcast sem usuário' };

        await expect(
            podcastService.createPodcast(data, mockPodcastModel, null)
        ).rejects.toThrow('Usuário não autenticado');
    });

    it('deve criar um podcast com sucesso', async () => { 
        const data = { title: 'Tech Talks', description: 'Conversas de tecnologia', category: 'Tecnologia'};
        const podcastCriado = { id: 1, title: 'Tech Talks', userId: 1 };

        mockPodcastModel.create.mockResolvedValue(podcastCriado);

        const result = await podcastService.createPodcast(data, mockPodcastModel, 1);

        expect(result.message).toBe('Podcast criado com sucesso!');
        expect(result.podcast).toHaveProperty('id', 1);
    });

    //----Listar Podcasts----

    it('deve listar todos os podcasts sem filtro de categoria', async () => {
        const lista = [{ id: 1, title: 'Tech Talks' }, { id: 2, title: 'Vida Saudável' }];
        mockPodcastModel.findAll.mockResolvedValue(lista);

        const result = await podcastService.listPodcasts(mockPodcastModel);

        expect(result).toHaveLength(2);
        expect(mockPodcastModel.findAll).toHaveBeenCalledWith({ where: {} });

    });
    
    it('deve listar podcasts filtrados por categoria', async () => { 
        const lista = [{ id: 1, title: 'Tech Talks', category: 'Tecnologia' }];
        mockPodcastModel.findAll.mockResolvedValue(lista);

        const result = await podcastService.listPodcasts(mockPodcastModel, 'Tecnologia');

        expect(result).toHaveLength(1);
        expect(mockPodcastModel.findAll).toHaveBeenCalledWith({ where: { category: 'Tecnologia' }});
    });
});