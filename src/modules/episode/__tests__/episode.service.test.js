import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as episodeService from '../episode.service.js';

describe('Episode Service', () => {
    //mockEpisodeModel simula o banco de dados sem a necessidade de conexão
    let mockEpisodeModel;
    let mockAudioFile;

    beforeEach(() => { 
        //Antes de cada teste, os mocks são resetados para garantir testes independentes
        mockEpisodeModel = { 
            create: vi.fn(),
            findAll: vi.fn(),
            findByPk: vi.fn(),
        };

        //Simula o objeto de arquivo que o multer geraria
        mockAudioFile = { filename: 'audio-teste.mp3' };
    });

    //----Publicar Episódio----
    it('deve publicar um episódio com sucesso', async () => { 
        const data = { title: 'Meu Podcast', description: 'Descrição', category: 'Tecnologia', podcastId: 1 };
        const episodeCriado = { id: 1, title: 'Meu Podcast', userId: 1, podcastId: 1 };

        //Diz ao mock para retornar o objeto criado
        mockEpisodeModel.create.mockResolvedValue(episodeCriado);

        const result = await episodeService.publishEpisode(data, mockAudioFile, null, mockEpisodeModel, 1);

        expect(result.message).toBe('Episódio publicado com sucesso!');
        expect(result.episode).toHaveProperty('id', 1);
    });

    it('deve lançar erro se o título estiver vazio', async () => { 
        const data = { title: '' };

        await expect( 
            episodeService.publishEpisode(data, mockAudioFile, null, mockEpisodeModel, 1)
        ).rejects.toThrow('Título é obrigatório');
    });

    it('deve lançar erro se o título for apenas espaços em branco', async () => { 
        const data = { title: '  ' };

        await expect( 
            episodeService.publishEpisode(data, mockAudioFile, null, mockEpisodeModel, 1)
        ).rejects.toThrow('Título é obrigatório');
    });

    it('deve lançar erro se o título ultrapassar 255 caracteres', async () => { 
        const data = { title: 'a'.repeat(256) };

        await expect( 
            episodeService.publishEpisode(data, mockAudioFile, null, mockEpisodeModel, 1)
        ).rejects.toThrow('Título não pode ultrapassar 255 caracteres');
    });

    it('deve lançar erro se podcastId não for informado', async () => { 
        const data = { title: 'Episódio sem podcst' };

        await expect( 
            episodeService.publishEpisode(data, mockAudioFile, null, mockEpisodeModel, 1)
        ).rejects.toThrow('Episódio precisa estar vinculado a um podcast');
    });

    it('deve lançar erro se o arquivo de áudio não for enviado', async() => { 
        const data = { title: 'Podcast sem áudio' };

        //null simula caso onde usuário não anexou nenhum arquivo
        await expect(
            episodeService.publishEpisode(data, null, null, mockEpisodeModel, 1)
        ).rejects.toThrow('Arquivo de áudio é obrigatório');
    });

    it('deve lançar erro se o userId não for fornecido', async () => { 
        const data = { title: 'Podcast sem usuário' };

        //null simula o caso onde não há sessão ativa
        await expect( 
            episodeService.publishEpisode(data, mockAudioFile, null, mockEpisodeModel, null)
        ).rejects.toThrow('Usuário não autenticado');
    });

    it('deve publicar episódio sem descrição nem categoria (campos opcionais)', async () => { 
        //Testa que campos opcionais não quebram o fluxo
        const data = { title: 'Episódio Simples', podcastId: 1 };
        const episodeCriado = { id: 2, title: 'Episódio Simples', description: null, userId: 1, podcastId: 1};

        mockEpisodeModel.create.mockResolvedValue(episodeCriado);

        const result = await episodeService.publishEpisode(data, mockAudioFile, null, mockEpisodeModel, 1);

        expect(result.episode).toHaveProperty('description', null);
    });

    //----Lista episódios----

    it('deve listar todos os episódios sem filtro de categoria', async () => { 
        const lista = [{ id: 1 }, { id: 2 }];
        mockEpisodeModel.findAll.mockResolvedValue(lista);

        const result = await episodeService.listEpisodes(mockEpisodeModel);

        expect(result).toHaveLength(2);
        //Garante que findAll foi chamado sem filtro nenhum
        expect(mockEpisodeModel.findAll).toHaveBeenCalledWith({ where: {} });
    });

    it ('deve listar episódios filtrados por categoria', async () => { 
        const lista = [{ id: 1, category: 'Tecnologia' }];
        mockEpisodeModel.findAll.mockResolvedValue(lista);

        const result = await episodeService.listEpisodes(mockEpisodeModel, 'Tecnologia');

        expect(result).toHaveLength(1);
        //Garante que findAll foi chamado com o filtro correto
        expect(mockEpisodeModel.findAll).toHaveBeenCalledWith({ where: { category: 'Tecnologia' } }); 
    });

    it('deve listar episódios filtrados por podcastId', async () => { 
        const lista = [{ id: 1, podcastId: 5 }];
        mockEpisodeModel.findAll.mockResolvedValue(lista);

        const result = await episodeService.listEpisodes(mockEpisodeModel, null, 5);

        expect(result).toHaveLength(1);
        expect(mockEpisodeModel.findAll).toHaveBeenCalledWith({ where: { podcastId: 5 } });
    });

    //----GetEpisodeById----

    it('deve retornar um episódio pelo ID', async () => { 
        const episode = { id: 1, title: 'Episódio 1' };
        mockEpisodeModel.findByPk.mockResolvedValue(episode);

        const result = await episodeService.getEpisodeById(1, mockEpisodeModel);

        expect(result).toHaveProperty('id', 1);
    });

    it('deve lançar erro se o ID não for fornecido', async() =>{ 
        await expect( 
            episodeService.getEpisodeById(null, mockEpisodeModel)
        ).rejects.toThrow('ID do episódio é obrigatório');
    });

    it('deve lançar erro se o episódio não for encontrado pelo ID', async () => { 
        //null simula o banco não encontrando nenhum registro
        mockEpisodeModel.findByPk.mockResolvedValue(null);

        await expect(
            episodeService.getEpisodeById(99, mockEpisodeModel)
        ).rejects.toThrow('Episódio não encontrado');
    });

    //----RegisterPlay----

    it('deve registrar reprodução de um episódio existente', async () => { 
        //O episódio mockado precisa ter o método increment
        const mockEpisode = { 
            id: 1,
            increment: vi.fn().mockResolvedValue(true)
        };
        mockEpisodeModel.findByPk.mockResolvedValue(mockEpisode);

        const result = await episodeService.registerPlay(1, mockEpisodeModel);

        expect(result.message).toBe('Reprodução registrada');
        //Garante que increment foi chamado no campo correto
        expect(mockEpisode.increment).toHaveBeenCalledWith('plays');
    });

    it('deve lançar erro ao registrar reprodução de epsiódio inexistente', async () => { 
        mockEpisodeModel.findByPk.mockResolvedValue(null);

        await expect(
            episodeService.registerPlay(99, mockEpisodeModel)
        ).rejects.toThrow('Episódio não encontrado');
    });

    //----Deletar Episódio----

    it('deve permitir que o dono delete o próprio episódio', async () => { 
        const mockEpisode = { id: 1, userId: 1, destroy: vi.fn().mockResolvedValue(true) };
        mockEpisodeModel.findByPk.mockResolvedValue(mockEpisode);

        const result = await episodeService.deleteEpisode(1, 1, false, mockEpisodeModel);

        expect(result.message).toBe('Episódio deletado com sucesso');
        expect(mockEpisode.destroy).toHaveBeenCalled();
    });

    it('deve permitir que um administrador delete qualquer episódio', async () => { 
        //O episódio pertence ao userId 2, mas o admin (userId 99) pode deletar
        const mockEpisode = { id: 1, userId: 2, destroy: vi.fn().mockResolvedValue(true)};
        mockEpisodeModel.findByPk.mockResolvedValue(mockEpisode);

        const result = await episodeService.deleteEpisode(1, 99, true, mockEpisodeModel);

        expect(result.message).toBe('Episódio deletado com sucesso');
    });

    it('deve impedir que o usuário comum delete epsiódio de outro usuário', async () => { 
        const mockEpisode = { id: 1, userId: 2, destroy: vi.fn() };
        mockEpisodeModel.findByPk.mockResolvedValue(mockEpisode);
        
        await expect( 
            episodeService.deleteEpisode(1, 99, false, mockEpisodeModel)
        ).rejects.toThrow('Você não tem permissão para deletar este episódio');
    });

});