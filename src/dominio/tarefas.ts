// funções das tarefas do painel lateral
import { novoId } from './id'
import type { DadosTarefa, EstadoTarefa, Prioridade, Tarefa } from './tipos'

// Backlog e Média (RN-12)
export const TAREFA_PADRAO: DadosTarefa = { titulo: '', estado: 'backlog', prioridade: 'media' }

const ORDEM_PRIORIDADE: Record<Prioridade, number> = { alta: 0, media: 1, baixa: 2 }

const ORDEM_ESTADO: Record<EstadoTarefa, number> = {
  aFazer: 0,
  emExecucao: 1,
  concluida: 2,
  cancelada: 3,
  backlog: 4,
}

//  (RN-10)
// primeiro pela prioridade (Alta, Média, Baixa)
// depois pelo estado (A fazer, Em execução, Concluída, Cancelada, Backlog)
// se empatar nos dois, a mais antiga vem antes
export function ordenarTarefas(lista: Tarefa[]): Tarefa[] {
  return [...lista].sort((a, b) => {
    const porPrioridade = ORDEM_PRIORIDADE[a.prioridade] - ORDEM_PRIORIDADE[b.prioridade]
    if (porPrioridade !== 0) return porPrioridade
    const porEstado = ORDEM_ESTADO[a.estado] - ORDEM_ESTADO[b.estado]
    if (porEstado !== 0) return porEstado
    return a.criadaEm - b.criadaEm
  })
}

// (UC12)
export function criarTarefa(dados: DadosTarefa, agora = Date.now()): Tarefa {
  return {
    ...dados,
    titulo: dados.titulo.trim(),
    id: novoId(),
    criadaEm: agora,
    atualizadaEm: agora,
  }
}

// (UC13)
export function atualizarTarefa(tarefa: Tarefa, dados: DadosTarefa, agora = Date.now()): Tarefa {
  return {
    ...tarefa,
    ...dados,
    titulo: dados.titulo.trim(),
    atualizadaEm: agora,
  }
}