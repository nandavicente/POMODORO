# Pomodoro Focus

Trabalho do Projeto 2 da disciplina do professor Luis Antonio Guisso Lopes (IFNMG - Campus Montes Claros).

O app é um temporizador Pomodoro para ajudar estudantes a organizar o tempo de estudo. Dá pra criar temporizadores com os tempos que quiser, rodar as sessões de foco com pausas, e anotar as tarefas do dia num painel do lado do timer. Tudo fica salvo no navegador, então se fechar a página a sessão continua de onde parou.

Link do app: https://pomodoro-ux1c.netlify.app/

## Grupo

- Maria Fernanda Vicente (nandavicente)
- João Victor (JoaoVictor-29)
- Victor Alexandre (victoralexandree)
- Kaylane (kaylane17)

Divisão do trabalho:

- Maria Fernanda: configuração do projeto, regras de negócio, testes, Local Storage, estado global, som de alerta e deploy no Netlify
- João Victor: cabeçalho, rotas, modais e tela de temporizadores
- Victor Alexandre: tela inicial com o timer, controles da sessão e avisos
- Kaylane: painel de tarefas e estilo/responsividade

## Tecnologias usadas

- React com TypeScript
- Vite
- React Router
- Local Storage
- Web Audio API (som de fim de fase e som ambiente)
- Vitest para os testes
- Netlify para hospedar

Não tem backend nem login, os dados ficam só no navegador de quem está usando.

## Como rodar

Precisa ter o Node.js (versão 20 ou mais nova) e o Git instalados.

```bash
git clone https://github.com/nandavicente/POMODORO.git
cd POMODORO
npm install
npm run dev
```

Depois é só abrir o endereço que aparece no terminal (geralmente http://localhost:5173).

Outros comandos:

- `npm test` roda os testes
- `npm run build` gera a versão de produção na pasta `dist`
- `npm run preview` abre a versão de produção no navegador

## O que o app faz

### Temporizadores

Na página Temporizadores dá pra criar, editar e excluir os presets. Cada um tem nome, tempo de foco, pausa curta, quantos ciclos até a pausa longa e o tempo da pausa longa. Quando ainda não tem nenhum, o formulário já vem com 25, 5, 4 e 15 minutos.

Os campos são validados e a mensagem de erro aparece embaixo de cada um. Se o temporizador estiver sendo usado na sessão, não dá pra editar nem excluir até encerrar a sessão. Para excluir sempre aparece uma confirmação.

### Sessão de foco

Na tela inicial o usuário escolhe o temporizador e inicia. A sessão vai alternando foco e pausa curta até completar os ciclos, depois vem a pausa longa e a sessão termina.

Os controles são: pausar, retomar, pular fase, reiniciar ciclos e encerrar. Reiniciar e encerrar pedem confirmação. Pular fase vai pra próxima fase mas não conta o ciclo como concluído.

Quando uma fase acaba toca um alerta e já começa a próxima. O título da aba também mostra o tempo e a fase (ex: 24:59 · Foco), assim dá pra acompanhar mesmo em outra aba. Tem também a opção de som ambiente.

Se trocar o temporizador no meio da sessão, a sessão atual é encerrada e começa outra com o novo.

### Quando fecha e abre o navegador

O tempo é calculado pelo horário em que a fase deve terminar, e não por um contador, por isso ele não atrasa quando a aba fica em segundo plano.

Quando a pessoa volta para o app:

- se a sessão estava pausada, ela continua pausada no mesmo ponto
- se estava rodando, o app calcula quanto tempo passou e já mostra a fase certa
- se todas as fases já terminaram, aparece como sessão concluída

Também dá pra descartar a sessão recuperada. Se os dados salvos estiverem com problema ou não der pra salvar, aparece um aviso.

### Tarefas

O painel de tarefas fica do lado do timer no computador e embaixo no celular. Cada tarefa tem título, estado (Backlog, A fazer, Em execução, Concluída, Cancelada) e prioridade (Baixa, Média, Alta). Tarefa nova começa como Backlog e Média.

A lista segue sempre a mesma ordem, sem filtro: primeiro pela prioridade (Alta, Média, Baixa) e depois pelo estado (A fazer, Em execução, Concluída, Cancelada, Backlog). Mexer nas tarefas não interfere no timer.

## Dados no Local Storage

- `pomodoro.presets`: lista de temporizadores
- `pomodoro.tarefas`: lista de tarefas
- `pomodoro.sessaoAtiva`: sessão que está rodando (é apagada quando a sessão termina ou é descartada)

## Organização das pastas

A gente separou as regras de negócio da parte visual, assim dá pra testar as regras sem precisar da tela.

```
src/
  dominio/          regras de negócio (sessão, presets, tarefas, validações) e testes
  persistencia/     leitura e gravação no Local Storage
  interface/
    estado.tsx      estado global do app
    audio/          alerta e som ambiente
    componentes/    cabeçalho, avisos, modais, formulários e painel de tarefas
    paginas/        Início e Temporizadores
  App.tsx           rotas
  main.tsx
```

## Testes

As regras de negócio têm 19 testes com Vitest. Eles testam as validações dos formulários, o bloqueio do preset em uso, pausar, pular e reiniciar, o recálculo do tempo quando reabre o navegador, a conclusão da sessão e a ordem das tarefas.

```bash
npm test
```

## Deploy

O deploy é feito no Netlify e atualiza sozinho sempre que entra algo na branch `main`. A configuração está no `netlify.toml` (build com `npm run build`, pasta `dist` e redirecionamento das rotas para o `index.html`, para o F5 funcionar na página de temporizadores).

## Referências

- Documento de Requisitos de Software da aplicação (passado pelo professor)
- Mapa de navegação e wireframes feitos pelo grupo