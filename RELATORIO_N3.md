> Este relatório documenta a evolução do projeto PodWave na N3. Para o histórico completo da N2 (módulo de episódios), veja `RELATORIO.md`.

# Relatório Técnico N3 - Módulo Podcast

Enquanto na N2, o foco do desenvolvimento foi no módulo de episódios, para a N3, foi implementado o módulo de Podcast enquanto programa que agrupa os episódios.

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

Foi utilizado o ciclo Red → Green → Refactor, função por função, assim como na N2.

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