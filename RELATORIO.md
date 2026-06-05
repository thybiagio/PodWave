# Relatório de Desenvolvimento — PodWave

## 1. Funcionalidade escolhida

Escolhi implementar o módulo de **episódios de podcast** como funcionalidade principal,
já que é o coração da plataforma. Sem episódios, o PodWave não existe — então faz
sentido que seja o módulo mais testado e mais cuidadoso do projeto.

O módulo cobre desde a publicação de um episódio até a reprodução e exclusão,
passando por listagem com filtro de categoria.

### Regras de negócio

Durante o desenvolvimento, algumas regras foram surgindo naturalmente:

- Título é obrigatório — e não pode ser só espaços em branco (um `"   "` não é título)
- Título não pode ultrapassar 255 caracteres, que é o limite da coluna no banco
- Sem arquivo de áudio, não há episódio — simples assim
- Só usuários autenticados publicam
- Episódios podem ser filtrados por categoria na listagem
- Cada vez que alguém ouve, o contador de plays sobe
- O episódio só pode ser deletado pelo próprio autor — ou por um administrador,
  pensando em casos de denúncia por conteúdo impróprio

---

## 2. Como apliquei o TDD

A ideia do TDD é escrever o teste antes do código. No começo parece estranho testar
algo que não existe, mas depois de um tempo faz todo sentido — o teste vira uma
especificação do que a função precisa fazer.

O ciclo que segui foi o **Red-Green-Refactor**:

**Red:** Escrevo o teste. Ele falha porque a função ainda não existe. Isso é esperado.

**Green:** Escrevo o mínimo de código para o teste passar. Sem firula, só o necessário.

**Refactor:** Com o teste verde, melhoro o código com calma — sem medo de quebrar
algo, porque os testes avisam se isso acontecer.

Na prática, a função `publishEpisode` foi construída assim: primeiro escrevi o teste
do título vazio, rodei e vi falhar. Aí criei a função com só aquela validação, rodei
de novo e passou. Depois o teste do áudio obrigatório, mesma coisa. Fui empilhando
validações guiadas pelos testes, em vez de tentar adivinhar tudo de uma vez.

---

## 3. Três testes explicados

### Teste 1 — Caminho feliz: publicação bem-sucedida

```js
it('deve publicar um episódio com sucesso', async () => {
    const data = { title: 'Meu Podcast', description: 'Descrição', category: 'Tecnologia' };
    const episodeCriado = { id: 1, title: 'Meu Podcast', userId: 1 };

    mockEpisodeModel.create.mockResolvedValue(episodeCriado);

    const result = await episodeService.publishEpisode(data, mockAudioFile, mockEpisodeModel, 1);

    expect(result.message).toBe('Episódio publicado com sucesso!');
    expect(result.episode).toHaveProperty('id', 1);
});
```

Esse é o teste do "tudo certo". Dados válidos entram, episódio sai criado.
Uso o `mockResolvedValue` para simular o retorno do banco sem precisar de um
banco real rodando. O teste verifica tanto a mensagem quanto o objeto retornado.

---

### Teste 2 — Validação de título com espaços

```js
it('deve lançar erro se o título for apenas espaços em branco', async () => {
    const data = { title: '   ' };

    await expect(
        episodeService.publishEpisode(data, mockAudioFile, mockEpisodeModel, 1)
    ).rejects.toThrow('Título é obrigatório');
});
```

Esse teste me fez adicionar o `.trim()` na validação. Uma string de espaços passa
pela verificação `!title`, então sem o trim o bug passaria despercebido. O TDD
ajudou exatamente aqui — eu pensei no caso antes de escrever o código.

---

### Teste 3 — Admin pode deletar qualquer episódio

```js
it('deve permitir que um administrador delete qualquer episódio', async () => {
    const mockEpisode = { id: 1, userId: 2, destroy: vi.fn().mockResolvedValue(true) };
    mockEpisodeModel.findByPk.mockResolvedValue(mockEpisode);

    const result = await episodeService.deleteEpisode(1, 99, true, mockEpisodeModel);

    expect(result.message).toBe('Episódio deletado com sucesso');
});
```

O episódio pertence ao usuário 2, mas o admin tem id 99. Mesmo assim a exclusão
deve passar. Esse caso surgiu de uma discussão sobre moderação de conteúdo — se
um episódio for denunciado, o admin precisa poder agir sem depender do autor.
O parâmetro `isAdmin: true` libera essa permissão no service.

---

## 4. Por que usar mocks?

Em todos os testes unitários, o banco de dados é substituído por um objeto falso
chamado `mockEpisodeModel`. Ele tem os mesmos métodos do Sequelize (`create`,
`findAll`, `findByPk`, `destroy`), mas controlados pelo `vi.fn()`.

O motivo é simples: teste unitário testa **lógica**, não infraestrutura. Se o banco
cair, o teste não deve falhar — porque o problema não está no código. Com mock,
o teste é rápido, previsível e roda em qualquer máquina sem configuração de banco.

---

## 5. Cobertura de código

O Vitest foi configurado com `@vitest/coverage-v8` para gerar relatório de cobertura
via `npm run test:coverage`. A meta mínima de 80% de linhas foi definida no
`vitest.config.js` com o campo `threshold`.

Resultado obtido nos services testados:

| Service | Stmts | Branch | Funcs | Lines |
|---|---|---|---|---|
| `episode.service.js` | 97% | 96% | 100% | 97% |
| `user.service.js` | 100% | 100% | 100% | 100% |

A cobertura guiou o desenvolvimento: linhas não cobertas sinalizaram cenários
esquecidos, como validação de `userId` nulo no `publishEpisode` e login com
`loginInput` vazio no `user.service`.

---

## 6. Testes do módulo de usuário

Além dos testes do `episode.service`, foram implementados 17 testes unitários
cobrindo o `user.service` — registro, login e busca de perfil.

### Teste — Login com senha incorreta

```js
it('deve lançar erro se a senha estiver incorreta', async () => {
    const mockUser = {
        id: 1, username: 'paulo',
        password: '$2b$10$hash'
    };
    mockUserModel.findOne.mockResolvedValue(mockUser);
    vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

    await expect(userService.login('paulo', 'senhaerrada', mockUserModel))
        .rejects.toThrow('Email/Usuário ou senha incorreta');
});
```

O `vi.spyOn` intercepta o `bcrypt.compare` e força o retorno `false`, simulando
uma senha errada sem precisar de hash real. Isso isola a lógica do service do
comportamento da biblioteca externa.