import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Video = sequelize.define('Video', {
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
    videoPath: { 
        type: DataTypes.STRING(255),
        allowNull: false
    },
    thumbnailPath: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    views: { 
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    userId: { 
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, { 
    tableName: 'videos',
    timestamps: true,
    underscored: true
});
export default Video;
