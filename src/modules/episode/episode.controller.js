import * as episodeService from './episode.service.js';
import Episode from './episode.model.js';

//Exibe o formulário de upload de episódio
export const getUploadForm = (req, res) => {
    res.render('upload', { title: 'Novo Episódio' });
};

//Processa o upload de um novo episódio
export const upload = async (req, res) => {
    try {
        console.log('CONTENT-TYPE:', req.headers['content-type']);
        console.log('BODY:', req.body);
        console.log('FILES:', req.files);
        console.log('FILE:', req.file);

    const audioFile = req.files?.find(
        file => file.fieldname === 'audio'
    );

    const coverFile = req.files?.find(
        file => file.fieldname === 'cover'
    );

    const result = await episodeService.publishEpisode(
        req.body,
        audioFile,
        coverFile,
        Episode,
        req.session.user.id
    );

        req.flash('success', result.message);
        res.redirect('/feed');
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/upload');
    }
};

//Lista episódios, com opção de filtrar por categoria
export const list = async (req, res) => { 
    try { 
        const { category } = req.query;
        const episodes = await episodeService.listEpisodes(Episode, category || null);
        
        res.render('feed', { title: 'Episódios | PodWave', episodes, category: category || null });
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/');
    }
};

//Exibe a página de um episódio específico
export const show = async (req, res) => {
    try{ 
        const episode = await episodeService.getEpisodeById(req.params.id, Episode);
        res.render('episode', { title: episode.title, episode });
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/episodes');
    }
};

//Registra uma reprodução - chamado via fetch/ajax quando o episódio é reproduzido
export const play = async (req, res) => {
    try {
        await episodeService.registerPlay(req.params.id, Episode);
        res.status(200).json({ message: 'ok' });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

//Deleta um episódio 
export const remove = async (req, res) => { 
    try{ 
        //Verifica se o usuário logado é administrador
        const isAdmin = req.session.user.role === 'admin';

        await episodeService.deleteEpisode( 
            req.params.id,
            req.session.user.id,
            isAdmin,
            Episode
        );

        req.flash('success', 'Episódio deletado com sucesso');
        res.redirect('/episodes');
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/episodes');
    }
};