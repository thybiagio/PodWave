import Episode from './episode.model.js';

// ----Publicar episódio----

//Recebe os dados do formulário, o arquivo de áudio, o model e o id do usuário
export const publishEpisode = async (data, audioFile, EpisodeModel, userId) =>{ 
    const { title, description, category } = data;

    // título obrigatório
    if (!title || title.trim() === '') {
        throw new Error('Título é obrigatório');
    }

    //título não pode ultrapassar 255 caracteres
    if (title.length > 255) {
        throw new Error('Título não pode ultrapassar 255 caracteres');
    }

    //arquivo de áudio obrigatório
    if (!audioFile) {
        throw new Error('Arquivo de áudio é obrigatório');
    }

    //só usuários autenticados podem publicar
    if (!userId) { 
        throw new Error('Usuário não autenticado');
    }

    //Cria um novo episódio no banco de dados, após validação
    const newEpisode = await EpisodeModel.create({
        title: title.trim(),
        description: description || null,
        audioPath: audioFile.filename,
        category: category || null,
        userId
    });

    return{ 
        message: 'Episódio publicado com sucesso!',
        episode: newEpisode
    };
};

// ----Listar episódios----

//Retorna todos os episódios, com opção de filtrar por categoria
export const listEpisodes = async (EpisodeModel, category = null) => { 
    //Se uma categoria for fornecida, filtra os episódios por categoria - senão retorna todos
    const  where = category ? { category } : {};

    const episodes = await EpisodeModel.findAll({ where });
    return episodes;
};

// ----Buscar episódio por ID----
export const getEpisodeById = async (id, EpisodeModel) => { 
    if (!id) {
        throw new Error ('ID do episódio é obrigatório');
    }

    const episode = await EpisodeModel.findByPk(id);

    //Se não encontrou nenhum episódio com esse ID
    if (!episode) {
        throw new Error('Episódio não encontrado');
    }

    return episode;
};

//----Registrar reprodução----
export const registerPlay = async (id, EpisodeModel) => { 
    const episode = await EpisodeModel.findByPk(id);

    if (!episode) {
        throw new Error('Episódio não encontrado');
    }

    //Incrementa o contador de reproduções
    await episode.increment('plays');

    return { message: 'Reprodução registrada' };
};

//----Deletar episódio----
export const deleteEpisode = async (id, EpisodeModel, userId, isAdmin) => {
    const episode = await EpisodeModel.findByPk(id);

    if (!episode) {
        throw new Error('Episódio não encontrado');
    }

    //Apenas o dono do episódio pode deletá-lo
    if (!isAdmin && episode.userId !== userId) {
        throw new Error('Você não tem permissão para deletar este episódio');
    }

    await episode.destroy();

    return { message: 'Episódio deletado com sucesso' };
};