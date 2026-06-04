import * as videoService from './video.service.js';
import Video from './video.model.js';

export const upload = async (req, res) => { 
    try{ 
        const result = await videoService.uploadVideo(
            req.body,
            req.files,
            Video,
            req.session.user.id
        );

        req.flash('success', result.message);
        res.redirect('/feed');
    } catch (error) { 
        req.flash('error', error.message);
        res.redirect('/upload');
    }
};

export const getUploadForm = (req, res) => { 
    res.render('upload', { title: 'Novo Vídeo' });
};