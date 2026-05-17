import { describe, it, expect } from 'vitest';
import { getHealth } from'../health.service.js';

describe('Health Service', () => { 
    it('deve retornar status OK quando o serviço está saudável', () => { 
        const result = getHealth();

        expect(result.status).toBe('OK');
        expect(result.message).toContain('saudável');
        expect(result).toHaveProperty('timestamp');
    });
});

