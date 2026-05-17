import { describe, it, expect } from 'vitest';
import { getHealth } from'../health.service.js';
import bcrypt from 'bcrypt';

describe('Health Service', () => { 
    it('deve retornar status OK quando o serviço está saudável', () => { 
        const result = getHealth();

        expect(result.status).toBe('OK');
        expect(result.message).toContain('saudável');
        expect(result).toHaveProperty('timestamp');
    });
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