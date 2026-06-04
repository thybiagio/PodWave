export const uploadVideo = async (data, files, VideoModel, userId) => { 
    const { title, description } = data;
    const videoFile = files.video?.[0];
    const thumbnailFile = files.thumbnail?.[0];

    if(!title) throw new Error('Otítulo do vídeo é obrigatório.');
    if(!videoFile) throw new Error('O arquivo de vídeo é obrigatório.');
    if(!thumbnailFile) throw new Error('A thumbnail é obrigatória.');

    //Validação de duração máxima (1 minuto) seria implementada aqui, usando uma biblioteca como ffmpeg para analisar o vídeo.

    const newVideo = await VideoModel.create({ 
        title, 
        description: description || null,
        videoPath: videoFile.filename,
        thumbnailPath: thumbnailFile.filename,
        userId
    });

    return{ 
        message: 'Video publicado com sucesso!',
        video: newVideo
    };
};