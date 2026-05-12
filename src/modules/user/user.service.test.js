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