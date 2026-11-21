import { describe, expect, it } from 'vitest'
import { criarTarefa, ordenarTarefas, TAREFA_PADRAO } from './tarefas'
import type { EstadoTarefa, Prioridade } from './tipos'

function tarefa(titulo: string, prioridade: Prioridade, estado: EstadoTarefa, criadaEm: number) {
  return criarTarefa({ titulo, prioridade, estado }, criadaEm)
}

describe('tarefas', () => {
  it('tarefa nova vem como Backlog e Média (RN-12)', () => {
    expect(TAREFA_PADRAO.estado).toBe('backlog')
    expect(TAREFA_PADRAO.prioridade).toBe('media')
  })

  it('ordena por prioridade e depois por estado (RN-10)', () => {
    const lista = [
      tarefa('baixa a fazer', 'baixa', 'aFazer', 1),
      tarefa('media executando', 'media', 'emExecucao', 2),
      tarefa('alta backlog', 'alta', 'backlog', 3),
      tarefa('alta a fazer', 'alta', 'aFazer', 4),
      tarefa('alta concluida', 'alta', 'concluida', 5),
    ]
    const titulos = ordenarTarefas(lista).map((t) => t.titulo)
    expect(titulos).toEqual(['alta a fazer', 'alta concluida', 'alta backlog', 'media executando', 'baixa a fazer'])
  })

  it('tira os espaços do título ao criar', () => {
    const t = criarTarefa({ titulo: '  Estudar  ', estado: 'aFazer', prioridade: 'alta' })
    expect(t.titulo).toBe('Estudar')
  })
})