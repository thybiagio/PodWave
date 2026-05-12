import { describe, it, expect, beforeEach } from 'vitest';
import * as userService from '../user.service.js';

describe('User Service - Cadastro', () => { 
    let mockUserModel;

    beforeEach(() => { 
        //Mock do modelo Sequelize 
        mockUserModel = {
            findOne: vi.fn(),
            create: vi.fn()
        };
    });

    it ('Red - deve retornar erro se as senhas não concidirem', async() => { 
        const data = { 
            username: 'paulo',
            email: 'paulo@test.com',
            password: '12345678',
            confirmPassword: '87654321', 
            fullName: 'Paulo Teste'
        };

        await expect(userService.register(data, mockUserModel)).rejects.toThrow('As senhas não coincidem');
    });
});

// Teste 2: senha muito curta
it (' Red - deve retornar erro se a senha tiver menos de 8 caracteres', async () => {
    const data = {
        username: 'paulo',
        email: 'paulo@test.com',
        password: '1234',
        confirmPassword: '123',
    };
    
    await expect(userService.register(data, mockUserModel)).rejects.toThrow('A senha deve ter pelo menos 8 caracteres');
});