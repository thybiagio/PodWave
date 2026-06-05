import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session from 'express-session';
import flash from 'connect-flash';
import expressLayouts from 'express-ejs-layouts';
import dotenv from 'dotenv';
import userRoutes from './modules/user/user.routes.js';
import episodeRoutes from './modules/episode/episode.routes.js';
dotenv.config();

const app = express();

app.set('views', path.join(process.cwd(), 'src/views/pages'));
app.set('layout', path.join(process.cwd(), 'src/views/layouts/main'));
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'src/public')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    res.locals.user = req.session.user || null;
    res.locals.title = 'PodWave';
    next();
});

app.get('/', (req, res) => res.render('index', { title: 'PodWave' }));
app.use('/', userRoutes);
app.use('/', episodeRoutes);

app.use((req, res) => res.status(404).render('404', { title: 'Página não encontrada' }));

export default app;