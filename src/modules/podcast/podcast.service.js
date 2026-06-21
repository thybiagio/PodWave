export const createPodcast = async (data, PodcastModel, userId) => {
    const { title, description, category } = data;

    if (!title || title.trim() === '') {
        throw new Error('Título é obrigatório');
    }

    if (title.length > 255) { 
        throw new Error('Título não pode ultrapassar 255 caracteres');
    }

    if (!userId) { 
        throw new Error('Usuário não autenticado');
    }

    const newPodcast = await PodcastModel.create({ 
        title: title.trim(),
        description: description || null,
        category: category || null,
        userId
    });

    return { 
        message: 'Podcast criado com sucesso!',
        podcast: newPodcast
    };
};

export const listPodcasts = async (PodcastModel, category = null) => { 
    const where = category ? { category } : {};

    const podcasts = await PodcastModel.findAll({ where })
    return podcasts;

};

export const getPodcastById = async (id, PodcastModel) => { 
    if (!id) { 
        throw new Error('ID do podcast é obrigatório');
    }

    const podcast = await PodcastModel.findByPk(id);
    
    if (!podcast) { 
        throw new Error('Podcast não encontrado');
    }

    return podcast;
}

export const updatePodcast = async (id, data, PodcastModel, userId) => { 
    const podcast = await PodcastModel.findByPk(id);

    if (!podcast) {
        throw new Error('Podcast não encontrado');
    }

    if (podcast.userId !== userId) { 
        throw new Error('Você não tem permissão para editar este podcast');
    }

    await podcast.update(data);

    return { 
        message: 'Podcast atualizado com sucesso!',
        podcast
    };

};

