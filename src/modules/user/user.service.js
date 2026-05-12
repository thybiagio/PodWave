export const register = async (data, UserModel) => {
    const { username, email, password, confirmPassword, fullName } = data;

    // Validação 1: senhas coincidem
    if (password !== confirmPassword) {
        throw new Error('As senhas não coincidem');
    }

    return { message: 'Usuário criado com sucesso (ainda sem salvar no banco)' };
};