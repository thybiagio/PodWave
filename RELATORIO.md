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

# Adições N3 - Módulo Podcast

Enquanto na N2, o foco do desenvolvimentofoi no módulo de episódios, para a N3, foi implementado o módulo de Podcast enquanto programa que agrupa os episódios.

O módulo cobre criação, listagem, busca por ID, edição e exclusão de podcasts. A implementação seguiu o mesmo padrão modular da N2: `model`, `service`, `controller`e `routes`, mais um arquivo central de associações Sequelize (`src/config/associations.js`) para evitar dependência circular entre os models.

## Regras de negócio

- Título é obrigatório - e não pode ser só espaços em branco
- Título não pode ultrapassar 255 caracteres, que é o limite da coluna no banco 
- Só usuários autenticados criam podcasts
- Só o dono pode editar o próprio podcast
- O dono ou um administrador pode deletar - pela mesma lógica de moderação do episódio: se um podcast tiver conteúdo inadequado, o admin precisa poder agir
- Podcasts podem ser filtrados por categoria na listagem geral, ou listados só os do usuário logado na tela "Meus Podcasts"
- Todo episódio precisa estar vinculado a um podcast - sem isso, o episódio não existe. Essa regra foi adicionada ao `episode.service.js` via TDD também, já que afeta o módula já existente.

## Aplicação do TDD

Foi utlizado o ciclo Red → Green → Refactor, função por função, assim como na N2.

O primeiro teste do `podcast.service.js` foi o de título vazio. Escrevi o teste,
rodei, e o erro foi `TypeError: createPodcast is not a function` — o arquivo nem
existia ainda. Esse é o Red mais puro possível.

```js
it('deve lançar erro se o título estiver vazio', async () => {
    const data = { title: '' };

    await expect(
        podcastService.createPodcast(data, mockPodcastModel, 1)
    ).rejects.toThrow('Título é obrigatório');
});
```

Aí criei o arquivo com o mínimo para passar:

```js
export const createPodcast = async (data, PodcastModel, userId) => {
    const { title } = data;

    if (!title || title.trim() === '') {
        throw new Error('Título é obrigatório');
    }
};
```

Green. Depois, o teste do limite de 255 caracteres. Green. Depois, o userId
obrigatório. Green. Depois, o caminho feliz com o `PodcastModel.create(...)`.
Green. A função foi crescendo guiada pelos testes, não o contrário.

O mesmo ciclo aconteceu quando adicionei a regra de `podcastId` obrigatório no
módulo de episódios — que já existia da N2. Primeiro o teste que falha:

```js
it('deve lançar erro se o podcastId não for informado', async () => {
    const data = { title: 'Episódio sem podcast' };

    await expect(
        episodeService.publishEpisode(data, mockAudioFile, null, mockEpisodeModel, 1)
    ).rejects.toThrow('Episódio precisa estar vinculado a um podcast');
});
```

Depois a validação no service. Green. Isso é o TDD sendo usado pra evoluir
código existente com segurança — os 17 testes antigos do episode continuaram
passando, porque o Red → Green foi cirúrgico.

## Três testes unitários explicados

### Teste 1 — Caminho feliz: criar podcast com sucesso

```js
it('deve criar um podcast com sucesso', async () => {
    const data = { title: 'Tech Talks', description: 'Conversas sobre tecnologia', category: 'Tecnologia' };
    const podcastCriado = { id: 1, title: 'Tech Talks', userId: 1 };

    mockPodcastModel.create.mockResolvedValue(podcastCriado);

    const result = await podcastService.createPodcast(data, mockPodcastModel, 1);

    expect(result.message).toBe('Podcast criado com sucesso!');
    expect(result.podcast).toHaveProperty('id', 1);
});
```

Esse é o teste do "tudo certo". Dados válidos entram, podcast sai criado. O mock
`mockResolvedValue(podcastCriado)` simula o banco retornando o registro sem precisar
de conexão real. As asserções verificam tanto a mensagem de confirmação quanto o
objeto retornado com o `id` esperado.

### Teste 2 — Dono pode deletar o próprio podcast

```js
it('deve permitir que o dono delete o próprio podcast', async () => {
    const podcastExistente = { id: 1, userId: 1, destroy: vi.fn().mockResolvedValue(true) };
    mockPodcastModel.findByPk.mockResolvedValue(podcastExistente);

    const result = await podcastService.deletePodcast(1, mockPodcastModel, 1, false);

    expect(podcastExistente.destroy).toHaveBeenCalled();
    expect(result.message).toBe('Podcast deletado com sucesso!');
});
```

O podcast pertence ao usuário 1, e quem está deletando também é o usuário 1. O
`destroy` é um `vi.fn()` embutido direto no objeto mockado — isso simula o método
Sequelize de exclusão. O `toHaveBeenCalled()` garante que a exclusão foi realmente
executada, não só que o retorno foi o esperado.

### Teste 3 — Usuário comum não pode editar podcast de outro

```js
it('deve lançar erro se outro usuário tentar editar o podcast', async () => {
    const podcastExistente = { id: 1, title: 'Tech Talks', userId: 1, update: vi.fn() };
    mockPodcastModel.findByPk.mockResolvedValue(podcastExistente);

    await expect(
        podcastService.updatePodcast(1, { title: 'Novo título' }, mockPodcastModel, 2)
    ).rejects.toThrow('Você não tem permissão para editar este podcast');
});
```

O podcast pertence ao usuário 1, mas quem tenta editar é o usuário 2. O service
compara os dois e rejeita. Esse caso surgiu de uma preocupação real: sem essa
validação, qualquer usuário logado poderia editar o podcast de qualquer outro.
O `.rejects.toThrow(...)` verifica a mensagem exata do erro.

## Dois testes de integração explicados

Os testes de integração do Podcast ficam em `podcast.controller.test.js`, usando
Supertest para fazer requisições HTTP reais contra o app Express em memória, com
o service mockado via `vi.mock`.

Uma diferença em relação ao `user.controller.test.js` da N2: as rotas de criação
e edição de podcast exigem login (`isAuthenticated`). Para contornar isso nos testes
sem fazer login real, o `express-session` foi mockado para injetar
`req.session.user` automaticamente em todas as requisições — simulando um usuário
autenticado sem acoplamento ao módulo de usuário.

### Teste 1 — GET /podcasts retorna 200

```js
it('deve listar podcasts e retornar status 200', async () => {
    podcastService.listPodcasts.mockResolvedValueOnce([
        { id: 1, title: 'Tech Talks' }
    ]);

    const response = await request(app).get('/podcasts');

    expect(response.status).toBe(200);
});
```

Verifica que a rota de listagem responde corretamente. O service retorna uma lista
mockada, o controller renderiza a view, e o Supertest confirma o status 200.
Nenhuma linha do banco foi tocada.

### Teste 2 — POST /podcasts/:id/edit redireciona após sucesso

```js
it('deve redirecionar para /podcasts após editar com sucesso', async () => {
    podcastService.updatePodcast.mockResolvedValueOnce({
        message: 'Podcast atualizado com sucesso!'
    });

    const response = await request(app)
        .post('/podcasts/1/edit')
        .send({ title: 'Tech Talks Atualizado' });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/podcasts');
});
```

Esse teste vai além do status — ele verifica o `headers.location`, ou seja, para
onde o redirect aponta. Isso garante que o controller redireciona para o lugar certo
depois de editar, não só que a requisição terminou com algum redirect qualquer.

## Instruções para rodar (N3)

As instruções são as mesmas da N2, com um passo adicional para o banco:
como a N3 adiciona a tabela `podcasts` e a coluna `podcast_id` na tabela
`episodes`, se você já tinha dados no banco da N2 será necessário recriar:

```sql
DROP DATABASE podwave_db;
CREATE DATABASE podwave_db;
```

Depois disso:

```bash
npm install
npm run dev   # cria as tabelas via sequelize.sync({ alter: true })
npm test      # 66 testes devem passar
```