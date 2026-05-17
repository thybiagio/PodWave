import bcrypt from 'bycrypt';

export const register = async (data, UserModel) => {
    const { username, email, password, confirmPassword, fullName = null } = data;

    if (password !== confirmPassword) {
        throw new Error('As senhas não coincidem');
    }

    if (password.length < 8) {
        throw new Error('A senha deve ter no mínimo 8 caracteres.');
    }

    // Verifica se o usuário já existe
    const existingUser = await UserModel.findOne({
        where: { [require('sequelize').Op.or]: [{ username }, { email }] }
    });

    if (existingUser) { 
        throw new Error('Este e-mail ou usuário já está cadastrado.');
    }

    // Hash da senha (RN-001)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Criação do usuário
    const newUser = await UserModel.create({
        username,
        email,
        password: hashedPassword,
        fullName
    });

    return {
        message: 'Usuário criado com sucesso!',
        user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            fullName: newUser.fullName
        }
    };
};

export const login = async (loginInput, password, UserModel) => {
    //Busca por email OU username
    const user = await UserModel.findOne({
        where: { 
            [require('sequelize').Op.or]: [
                { email: loginInput },
                { username: loginInput }
            ]
        }
    })


    if (!user) {
    throw new Error('Email/Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
    throw new Error('E-mail/Usuário ou senha incorretos');
    }

    return { 
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    profilePicture: user.profilePicture
    };
};

//Função auxiliar para buscar perfil
export const getProfile = async (userId, UserModel) => {
    const user = await UserModel.findByPk(userId, {
        attributes: ['id', 'username', 'email', 'fullName', 'bio', 'profilePicture']
    });

    if (!user) throw new Error('Usuário não encontrado.');
    return user;
};
