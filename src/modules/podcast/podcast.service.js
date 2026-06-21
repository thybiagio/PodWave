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

