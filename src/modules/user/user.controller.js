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