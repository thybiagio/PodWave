import * as podcastService from './podcast.service.js';
import Podcast from './podcast.model.js';
import * as episodeService from '../episode/episode.service.js';
import Episode from '../episode/episode.model.js';

//Exibe formulário criação do podcast
export const getCreateForm = (req, res) => { 
    res.render('podcast-form', { title: 'Novo Podcast'});
};

//Processa a criação
export const create = async (req, res) => { 
    try{ 
        const coverFile = req.files?.find( 
            file => file.fieldname === 'cover'
        );

        const data = { 
            ...req.body,
            coverPath: coverFile ? coverFile.filename : undefined
        };

        const result = await podcastService.createPodcast( 
            data,
            Podcast,
            req.session.user.id
        );

        req.flash('success', result.message);
        res.redirect('/podcasts');
    } catch (error) { 
        req.flash('error', error.message);
        res.redirect('/podcasts/new');
    }
};

//Lista podcasts
export const list = async (req, res) => {
    try {
        const { category } = req.query;
        const podcasts = await podcastService.listPodcasts(Podcast, category || null);

        res.render('podcasts', { title: 'Podcasts | PodWave', podcasts, category: category || null });
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/');
    }
};

//Lista apenas os podcasts do usuário logado
export const mine = async (req, res) => {
    try {
        const podcasts = await podcastService.listPodcasts(Podcast, null, req.session.user.id);

        res.render('my-podcasts', { title: 'Meus Podcasts | PodWave', podcasts });
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/podcasts');
    }
};

//Exibe a página de um podcast
export const show = async (req, res) => { 
    try{ 
        const podcast = await podcastService.getPodcastById(req.params.id, Podcast);
        const episodes = await episodeService.listEpisodes(Episode, null, podcast.id);
        res.render('podcast', { title: podcast.title, podcast, episodes });
    } catch (error) { 
        req.flash('error', error.message);
        res.redirect('/podcasts');
    }
};

//Exibe formuláro de edição do podcast
export const getEditForm = async (req, res) => { 
    try{ 
        const podcast = await podcastService.getPodcastById(req.params.id, Podcast);
        res.render('podcast-form', { title: 'Editar Podcast', podcast });
    } catch (error) { 
        req.flash('error', error.message);
        res.redirect('/podcasts');
    }
};

//Processa a edição
export const update = async (req, res) => { 
    try{ 
        const result = await podcastService.updatePodcast( 
            req.params.id,
            req.body,
            Podcast,
            req.session.user.id
        );

        req.flash('success', result.message);
        res.redirect('/podcasts');
    } catch (error) { 
        req.flash('error', error.message); 
        res.redirect(`/podcasts/${req.params.id}/edit`);
    }
};

//Deleta um podcast
export const remove = async (req, res) => { 
    try{ 
        const isAdmin = req.session.user.role === 'admin';

        await podcastService.deletePodcast( 
            req.params.id,
            Podcast,
            req.session.user.id,
            isAdmin
        );

        req.flash('success', 'Podcast deletado com sucesso');
        res.redirect('/podcasts');
    } catch (error) { 
        req.flash('error', error.message);
        res.redirect('/podcasts');
    }
};
