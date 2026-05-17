import * as userService from './user.service.js';
import User from './user.model.js';

export const register = async (req, res) => {
    try {
        const result = await userService.register(req.body, User);

        req.flash('success', result.message);
        res.redirect('/login');
    
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/register');
    }
};

export const login = async (req, res) => {
    try{ 
        const { login, password } = req.body; //"login" pode ser email ou username

        const userData = await userService.login(login, password, User);

        req.session.user = userData; //salva na sessão
        req.flash('success', 'Login realizado com sucesso!');
        res.redirect('/feed');

    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/login');
    }
};

export const logout = (req, res) => {
    req.session.destroy(() => { 
        res.redirect('/');
    });
};