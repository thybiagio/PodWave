export const register = async (data, UserModel) => {
    const { username, email, password, confirmPassword, fullName } = data;

    // Validação 1: senhas coincidem
    if (password !== confirmPassword) {
        throw new Error('As senhas não coincidem');
    }

    //Validação 2: senha tem pelo menos 8 caracteres
    if (password.length < 8) {
        throw new Error('A senha deve ter pelo menos 8 caracteres');
    }

    return { message: 'Usuário criado com sucesso (ainda sem salvar no banco)' };
};

