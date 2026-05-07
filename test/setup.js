import { vi } from 'vitest';

//Mocks globais úteis para todos os testes
global.mockReq = (body = {}, session = {}) => ({ 
    body,
    session,
    flash: vi.fn(),
    get: vi.fn()
});

global.mockRes = () => { 
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.redirect = vi.fn().mockReturnValue(res);
    res.render = vi.fn().mockReturnValue(res);
    return res;
};

