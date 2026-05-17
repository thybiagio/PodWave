import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../../app.js';
import * as userService from '../user.service.js';

vi.mock('../user.service.js');
vi.mock('../user.model.js');

describe('User Controller - Cadastro', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('deve redirecionar para /login com sucesso', async () => {
        userService.register.mockResolvedValueOnce({
            message: 'Usuário criado com sucesso!' 
        });

    const response = await request(app)
        .post('/register')
        .send({
            name: 'testuser',
            email: 'test@test.com',
            password: '12345678',
            confirmPassword: '12345678'
        });
    
    expect(response.status).toBe(302); //redirect
    expect(response.headers.location).toBe('/login');
    });

    it('deve redirecionar para /register em caso de erro', async () => {
        userService.register.mockRejectedValueOnce(new Error('As senhas não coincidem'));

        const response = await request(app)
            .post('/register')
            .send({
                name: 'testuser',
                email: 'test@test.com',
                password: '12345678',
                confirmPassword: '12345678'
            });

        expect(response.status).toBe(302); //redirect
        expect(response.headers.location).toBe('/register');
    });

    it('deve fazer login com sucesso e redirecionar para /feed', async () => {
        //Mock do service
        userService.login.mockResolvedValueOnce({
            id: 1,
            username: 'testuser',
        });

        const response = await request(app)
            .post('/login')
            .send({
                login: 'testuser',
                password: '12345678'
            });

        expect(response.status).toBe(302); 
        expect(response.headers.location).toBe('/feed');
    });
});