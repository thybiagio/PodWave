import 'dotenv/config';
import app from './app.js';
import sequelize from './config/database.js';

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`PodWave rodando em http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Erro ao conectar no banco:', err.message);
    });