export const isAuthenticated = (req, res, next) => {
    if (req.session.user) { 
        return next();
    }

    req.flash('error', 'Você precisa estar logado para acessar esta página.');
    res.redirect('/login');
};

export default isAuthenticated;