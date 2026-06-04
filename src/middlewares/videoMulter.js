import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => { 
        if (file.fieldname === 'video'){ 
            cb(null, 'src/public/uploads/videos');
        } else if (file.fieldname === 'thumbnail') {
            cb(null, 'src/public/uploads/thumbnails');
        }
    }   
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'video') {
        if (['video/mp4', 'video/webm'].includes(file.mimetype)) { 
            cb(null, true);
        } else { 
            cb(new Error('Formato de vídeo inválido. Apenas MP4 e WebM são permitidos.'), false);
        }
    } else if (file.fieldname === 'thumbnail') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else { 
            cb(new Error('A capa deve ser uma imagem.'), false);
        }
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // Limite de 50MB para vídeos
});

export default upload;