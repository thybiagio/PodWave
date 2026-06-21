import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

//Model do podcast
//Define a estrutura da tabela 'podcasts' no bd
const Podcast = sequelize.define('Podcast', { 
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
    coverPath: { 
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: 'default-cover.png'
    },
    category: { 
        type: DataTypes.STRING(100),
        allowNull: true
    },
    userId: { 
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, { 
    tableName: 'podcasts',
    timestamps: true,
    underscored: true
});

export default Podcast;