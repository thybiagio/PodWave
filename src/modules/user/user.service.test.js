import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as userService from './user.service.js';
import bcrypt from 'bcryptjs';

describe('User Service - Cadastro', () => { 
    let mockUserModel;

    beforeEach(() => { 
        // Mock do modelo Sequelize 
        mockUserModel = {
            findOne: vi.fn(),
            create: vi.fn()
        };
    });

    it('Red - deve retornar erro se as senhas não concidirem', async () => { 
        const data = { 
            username: 'paulo',
            email: 'paulo@test.com',
            password: '12345678',
            confirmPassword: '87654321', 
            fullName: 'Paulo Teste'
        };

        await expect(userService.register(data, mockUserModel)).rejects.toThrow('As senhas não coincidem');
    });

    // Teste 2: senha muito curta
    it('Red - deve retornar erro se a senha tiver menos de 8 caracteres', async () => {
        const data = {
            username: 'paulo',
            email: 'paulo@test.com',
            password: '1234',
            confirmPassword: '1234',
        };
        
        await expect(userService.register(data, mockUserModel))
        .rejects
        .toThrow('A senha deve ter no mínimo 8 caracteres.');
    });

    // Teste 3: Usuário já existe
    it('deve retornar erro se o username ou e-mail já estiverem cadastrados', async () => {
        const data = {
            username: 'paulo',
            email: 'paulo@test',
            password: '12345678',
            confirmPassword: '12345678',
        };

        // Simula que o usuário já existe
        mockUserModel.findOne.mockResolvedValue({ id: 1}); //username existe

        await expect(userService.register(data, mockUserModel))
            .rejects
            .toThrow('Este e-mail ou usuário já está cadastrado.');
    });

    it('deve fazer login com sucesso usando email ou username', async() => {
    const mockUser = {
        id: 1,
        username: 'paulo',
        email: 'paulo@test.com',
        password: '$2b$10$6QwM3mEVTc6VIWdxM0j6weRb3FxOcQmpFzBJK.F2Js1ChjZ8sX3Dm', 
        fullName: 'Paulo Teste'
    };

    mockUserModel.findOne.mockResolvedValueOnce(mockUser); // Simula busca por email
    // Simular bcrypt.compare
    vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true); // Simula senha correta

    const result = await userService.login('paulo', 'teste123', mockUserModel);

    expect(result.id).toBe(1);
    expect(result.username).toBe('paulo');

    });
});