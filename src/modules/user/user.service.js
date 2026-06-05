import bcrypt from 'bcryptjs';
import {Op } from 'sequelize';

export const register = async (data, UserModel) => { 
    const { username, email, password, confirmPassword, fullName = null } = data;

    if (password !== confirmPassword) { 
        throw new Error('As senhas não coincidem');
    }

    if (password.length < 8) { 
        throw new Error('A senha deve ter no mínimo 8 caracteres.');
    }

    if (!username || username.trim() === '') { 
        throw new Error('Nome de usuário é obrigatório.');
    }

    if (!email || email.trim() === '') {
        throw new Error('Email é obrigatório');
    };

    const existingUser = await UserModel.findOne({ 
        where: { [Op.or]: [{ username }, { email }] }
    });

    if (existingUser) { 
        throw new Error('Este email ou usuário já está cadastrado.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create({ 
        username,
        email, 
        password: hashedPassword,
        fullName
    });

    return{ 
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
    if (!loginInput || loginInput.trim() === '') { 
        throw new Error('Email/Usuário é obrigatório.');
    }

    if (!password || password.trim() === '') { 
        throw new Error('Senha é obrigatória.');
    }

    const user = await UserModel.findOne({ 
        where: { 
            [Op.or]: [
                { email: loginInput },
                { username: loginInput }
            ]
        }
    });

    if (!user){ 
        throw new Error('Email/Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) { 
        throw new Error('Email/Usuário ou senha incorreta');
    }

    return { 
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        profilePicture: user.profilePicture
    };
};


export const getProfile = async (userId, UserModel) => { 
    if (!userId) { 
        throw new Error('ID do usuário é obrigatório.');
    }

    const user = await UserModel.findByPk(userId, { 
        attributes: ['id', 'username', 'email', 'fullName', 'bio', 'profilePicture']
    });

    if (!user) throw new Error('Usuário não encontrado.');
    return user;
}; 