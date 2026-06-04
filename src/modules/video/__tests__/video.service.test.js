import { describe, it, expect } from 'vitest';
import * as videoService from '../video.service.js';

describe('Video Service', () => {
    it('deve falhar se o título estiver vazio', async () => { 
        const data = { title: '' };
        const files = { video: [{}], thumbnail: [{}] };

        await expect(videoService.uploadVideo(data, files))
        .rejects.toThrow('Título é obrigatório');
    });
});