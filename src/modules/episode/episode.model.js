import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

//Model do episódio de podcast
//Define a estrutura da tabela 'episodes' no banco de dados
const Episode = sequelize.define('Episode', {
    id: { 
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: { 
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    audioPath: {
        //Caminho do arquivo de áudio no servidor
        type: DataTypes.STRING(255),
        allowNull: false
    },
    coverPath: {
        //Caminho da imagem de capa no servidor
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: 'default-cover.png'
    },
    duration: { 
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    plays: { 
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    userId: { 
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, { 
    tableName: 'episodes',
    timestamps: true,
    underscored: true
});

export default Episode;