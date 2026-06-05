import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as userService from '../user.service.js';
import bcrypt from 'bcryptjs';

describe('User Service - Cadastro e Login', () => {
    let mockUserModel;

    beforeEach(() => {
        mockUserModel = {
            findOne: vi.fn(),
            findByPk: vi.fn(),
            create: vi.fn()
        };
        vi.clearAllMocks();
    });

    // ---- REGISTER ----

    it('deve lançar erro se as senhas não coincidirem', async () => {
        const data = {
            username: 'paulo', email: 'paulo@test.com',
            password: '12345678', confirmPassword: '87654321',
        };
        await expect(userService.register(data, mockUserModel))
            .rejects.toThrow('As senhas não coincidem');
    });

    it('deve lançar erro se a senha tiver menos de 8 caracteres', async () => {
        const data = {
            username: 'paulo', email: 'paulo@test.com',
            password: '1234', confirmPassword: '1234',
        };
        await expect(userService.register(data, mockUserModel))
            .rejects.toThrow('A senha deve ter no mínimo 8 caracteres.');
    });

    it('deve lançar erro se o username estiver vazio', async () => {
        const data = {
            username: '', email: 'paulo@test.com',
            password: '12345678', confirmPassword: '12345678',
        };
        await expect(userService.register(data, mockUserModel))
            .rejects.toThrow('Nome de usuário é obrigatório.');
    });

    it('deve lançar erro se o e-mail estiver vazio', async () => {
        const data = {
            username: 'paulo', email: '',
            password: '12345678', confirmPassword: '12345678',
        };
        await expect(userService.register(data, mockUserModel))
            .rejects.toThrow('Email é obrigatório');
    });

    it('deve lançar erro se o e-mail ou username já estiverem cadastrados', async () => {
        const data = {
            username: 'paulo', email: 'paulo@test.com',
            password: '12345678', confirmPassword: '12345678',
        };
        mockUserModel.findOne.mockResolvedValue({ id: 1 });
        await expect(userService.register(data, mockUserModel))
            .rejects.toThrow('Este email ou usuário já está cadastrado.');
    });

    it('deve criar usuário com sucesso e retornar mensagem', async () => {
        const data = {
            username: 'novousuario', email: 'novo@test.com',
            password: 'senha1234', confirmPassword: 'senha1234',
            fullName: 'Novo Usuário'
        };
        mockUserModel.findOne.mockResolvedValue(null);
        mockUserModel.create.mockResolvedValue({
            id: 5, username: 'novousuario',
            email: 'novo@test.com', fullName: 'Novo Usuário'
        });

        const result = await userService.register(data, mockUserModel);

        expect(result.message).toBe('Usuário criado com sucesso!');
        expect(result.user).toHaveProperty('id', 5);
        expect(result.user).toHaveProperty('username', 'novousuario');
    });

    it('deve criar usuário sem fullName (campo opcional)', async () => {
        const data = {
            username: 'semfullname', email: 'sem@test.com',
            password: 'senha1234', confirmPassword: 'senha1234',
        };
        mockUserModel.findOne.mockResolvedValue(null);
        mockUserModel.create.mockResolvedValue({
            id: 6, username: 'semfullname', email: 'sem@test.com', fullName: null
        });

        const result = await userService.register(data, mockUserModel);
        expect(result.user.fullName).toBeNull();
    });

    it('deve chamar bcrypt.hash ao registrar usuário', async () => {
        const data = {
            username: 'hashtest', email: 'hash@test.com',
            password: 'senha1234', confirmPassword: 'senha1234',
        };
        mockUserModel.findOne.mockResolvedValue(null);
        mockUserModel.create.mockResolvedValue({
            id: 7, username: 'hashtest', email: 'hash@test.com', fullName: null
        });

        const hashSpy = vi.spyOn(bcrypt, 'hash');
        await userService.register(data, mockUserModel);
        expect(hashSpy).toHaveBeenCalled();
    });

    // ---- LOGIN ----

    it('deve lançar erro se o loginInput estiver vazio', async () => {
        await expect(userService.login('', 'senha123', mockUserModel))
            .rejects.toThrow('Email/Usuário é obrigatório.');
    });

    it('deve lançar erro se a senha estiver vazia', async () => {
        await expect(userService.login('paulo', '', mockUserModel))
            .rejects.toThrow('Senha é obrigatória.');
    });

    it('deve lançar erro se o usuário não for encontrado', async () => {
        mockUserModel.findOne.mockResolvedValue(null);
        await expect(userService.login('naoexiste', 'senha123', mockUserModel))
            .rejects.toThrow('Email/Usuário não encontrado');
    });

    it('deve lançar erro se a senha estiver incorreta', async () => {
        const mockUser = {
            id: 1, username: 'paulo', email: 'paulo@test.com',
            password: '$2b$10$hash', fullName: 'Paulo'
        };
        mockUserModel.findOne.mockResolvedValue(mockUser);
        vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

        await expect(userService.login('paulo', 'senhaerrada', mockUserModel))
            .rejects.toThrow('Email/Usuário ou senha incorreta');
    });

    it('deve fazer login com sucesso e retornar dados do usuário', async () => {
        const mockUser = {
            id: 1, username: 'paulo', email: 'paulo@test.com',
            password: '$2b$10$hash', fullName: 'Paulo Teste',
            profilePicture: 'default-profile.png'
        };
        mockUserModel.findOne.mockResolvedValue(mockUser);
        vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

        const result = await userService.login('paulo', 'senha1234', mockUserModel);

        expect(result.id).toBe(1);
        expect(result.username).toBe('paulo');
        expect(result).toHaveProperty('email', 'paulo@test.com');
        expect(result).toHaveProperty('profilePicture');
    });

    it('deve permitir login por e-mail (findOne chamado com Op.or)', async () => {
        const mockUser = {
            id: 2, username: 'teste', email: 'teste@email.com',
            password: '$2b$10$hash', fullName: null, profilePicture: null
        };
        mockUserModel.findOne.mockResolvedValue(mockUser);
        vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

        const result = await userService.login('teste@email.com', 'senha1234', mockUserModel);
        expect(mockUserModel.findOne).toHaveBeenCalledTimes(1);
        expect(result.username).toBe('teste');
    });

    // ---- GET PROFILE ----

    it('deve lançar erro se userId não for fornecido ao buscar perfil', async () => {
        await expect(userService.getProfile(null, mockUserModel))
            .rejects.toThrow('ID do usuário é obrigatório.');
    });

    it('deve lançar erro se o usuário não for encontrado pelo ID', async () => {
        mockUserModel.findByPk.mockResolvedValue(null);
        await expect(userService.getProfile(99, mockUserModel))
            .rejects.toThrow('Usuário não encontrado.');
    });

    it('deve retornar o perfil do usuário com sucesso', async () => {
        const mockUser = {
            id: 1, username: 'paulo', email: 'paulo@test.com',
            fullName: 'Paulo', bio: 'Dev', profilePicture: 'foto.png'
        };
        mockUserModel.findByPk.mockResolvedValue(mockUser);

        const result = await userService.getProfile(1, mockUserModel);
        expect(result).toHaveProperty('id', 1);
        expect(result).toHaveProperty('username', 'paulo');
    });
});