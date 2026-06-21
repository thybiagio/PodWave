import * as episodeService from './episode.service.js';
import Episode from './episode.model.js';
import * as podcastService from '../podcast/podcast.service.js';
import Podcast from '../podcast/podcast.model.js';

//Exibe o formulário de upload de episódio, dentro de um podcast específico
export const getUploadForm = async (req, res) => {
    try {
        const podcast = await podcastService.getPodcastById(req.params.podcastId, Podcast);
        res.render('upload', { title: 'Novo Episódio', podcast });
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/podcasts');
    }
};

//Processa o upload de um novo episódio, vinculado ao podcast da URL
export const upload = async (req, res) => {
    try {
        const audioFile = req.files?.find(
            file => file.fieldname === 'audio'
        );

        const coverFile = req.files?.find(
            file => file.fieldname === 'cover'
        );

        const data = {
            ...req.body,
            podcastId: req.params.podcastId
        };

        const result = await episodeService.publishEpisode(
            data,
            audioFile,
            coverFile,
            Episode,
            req.session.user.id
        );

        req.flash('success', result.message);
        res.redirect(`/podcasts/${req.params.podcastId}`);
    } catch (error) {
        req.flash('error', error.message);
        res.redirect(`/podcasts/${req.params.podcastId}/upload`);
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
//Exibe a página de um episódio específico
export const show = async (req, res) => {
    try{ 
        const episode = await episodeService.getEpisodeById(req.params.id, Episode);
        const podcast = await podcastService.getPodcastById(episode.podcastId, Podcast);
        res.render('episode', { title: episode.title, episode, podcast });
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