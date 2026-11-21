// (RNF-09)
import { sessaoValida } from '../dominio/sessao'
import type { Preset, SessaoAtiva, Tarefa } from '../dominio/tipos'

//  nomes das chaves que o documento pede (seção 11.4)
export const CHAVES = {
  presets: 'pomodoro.presets',
  tarefas: 'pomodoro.tarefas',
  sessaoAtiva: 'pomodoro.sessaoAtiva',
}

// (RNF-06)
export class ErroPersistencia extends Error {}

function ler(chave: string): unknown {
  try {
    const texto = localStorage.getItem(chave)
    if (texto === null) return null
    return JSON.parse(texto)
  } catch {
    return undefined
  }
}

function gravar(chave: string, valor: unknown): void {
  try {
    if (valor === null) {
      localStorage.removeItem(chave)
    } else {
      localStorage.setItem(chave, JSON.stringify(valor))
    }
  } catch {
    throw new ErroPersistencia('Falha ao salvar no Local Storage (armazenamento cheio ou bloqueado).')
  }
}

export function carregarPresets(): Preset[] {
  const valor = ler(CHAVES.presets)
  return Array.isArray(valor) ? (valor as Preset[]) : []
}

export function carregarTarefas(): Tarefa[] {
  const valor = ler(CHAVES.tarefas)
  return Array.isArray(valor) ? (valor as Tarefa[]) : []
}

//  (R-03)
export type LeituraSessao =
  | { tipo: 'ausente' }
  | { tipo: 'ok'; sessao: SessaoAtiva }
  | { tipo: 'invalida' }
export function carregarSessao(): LeituraSessao {
  const valor = ler(CHAVES.sessaoAtiva)
  if (valor === null) return { tipo: 'ausente' }
  if (sessaoValida(valor)) return { tipo: 'ok', sessao: valor }
  return { tipo: 'invalida' }
}

export function salvarPresets(presets: Preset[]): void {
  gravar(CHAVES.presets, presets)
}

export function salvarTarefas(tarefas: Tarefa[]): void {
  gravar(CHAVES.tarefas, tarefas)
}

export function salvarSessao(sessao: SessaoAtiva | null): void {
  gravar(CHAVES.sessaoAtiva, sessao)
}