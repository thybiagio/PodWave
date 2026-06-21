import User from '../module/user/user.model.js';
import Episode from '../modules/episode/episode.model.js';
import Podcast from '../modules/podcast/podcast.model.js';

//Centraliza as associações entre os models para evitar import circular

User.hasMany(Podcast, { foreignKey: 'userId', as: 'podcasts' });
Podcast.belongsTo(User, { foreignKey: 'userId', as: 'author' });

Podcast.hasMany(Episode, { foreignKey: 'podcastId', as: 'episodes' });
Episode.belongsTo(Podcast, { foreignKey: 'podcastId', as: 'podcast' });

User.hasMnay(Episode, { foreignKey: 'userId', as: 'episodes' });
Episode.belongsTo(User, { foreignKey: 'userId', as: 'author' });

export { User, Episode, Podcast };