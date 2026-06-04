import express from 'express';
const router = express.Router();

import * as videoController from './video.controller.js';
import isAuthenticated from '../../middlewares/auth.js';
import upload from '../../middlewares/videoMulter.js';

router.get('/upload', isAuthenticated, videoController.getUploadForm);

//Upload com 2 campos: video + thumbnail
router.post('/upload',
    isAuthenticated,
    upload.fields([
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 }
    ]),
    videoController.upload
);

export default router;