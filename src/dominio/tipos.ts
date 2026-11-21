export type Fase = 'foco' | 'pausaCurta' | 'pausaLonga'
export type StatusSessao = 'emAndamento' | 'pausada' | 'concluida'
export type EstadoTarefa = 'backlog' | 'aFazer' | 'emExecucao' | 'concluida' | 'cancelada'
export type Prioridade = 'baixa' | 'media' | 'alta'

// preset (temporizador personalizado) - 11.1
export interface Preset {
  id: string
  nome: string
  tempoFocoMin: number
  tempoPausaCurtaMin: number
  ciclosAntesPausaLonga: number
  tempoPausaLongaMin: number
  criadoEm: number // parte que guarda data em milissegundos (Date.now())
  atualizadoEm: number
}

// tempos do preset, a sessão usa isso pra guardar a cópia
export interface ParametrosPreset {
  tempoFocoMin: number
  tempoPausaCurtaMin: number
  ciclosAntesPausaLonga: number
  tempoPausaLongaMin: number
}

// preenchimento do usuario no formulário de preset
export interface DadosPreset extends ParametrosPreset {
  nome: string
}

// parte que o formato da sessão que está rodando - 11.2
export interface SessaoAtiva {
  id: string
  presetId: string // guarda qual preset começou a sessão
  // fazendo a cópia dos tempos quando a sessão começa (RN-05)
  // assim se editar o preset depois, a sessão não muda
  snapshotPreset: DadosPreset
  faseAtual: Fase
  cicloAtual: number // começa em 1
  // parte que conta quantos focos terminaram sozinhos (pular não conta, RN-03)
  ciclosConcluidos: number
  status: StatusSessao
  inicioFaseEm: number
  fimFasePrevistoEm: number // aqui fica o controle do horário que a fase acaba, usado pra calcular o tempo
  pausadaEm: number | null
  tempoRestanteAoPausarMs: number | null
  criadaEm: number
  atualizadaEm: number
}

// Aqui ta a parte da tarefa do painel lateral - 11.3
export interface Tarefa {
  id: string
  titulo: string
  estado: EstadoTarefa
  prioridade: Prioridade
  criadaEm: number
  atualizadaEm: number
}

export interface DadosTarefa {
  titulo: string
  estado: EstadoTarefa
  prioridade: Prioridade
}

// fazendo a ligação de cada valor com o texto que aparece na tela
export const ROTULO_FASE: Record<Fase, string> = {
  foco: 'Foco',
  pausaCurta: 'Pausa curta',
  pausaLonga: 'Pausa longa',
}

export const ROTULO_ESTADO: Record<EstadoTarefa, string> = {
  backlog: 'Backlog',
  aFazer: 'A fazer',
  emExecucao: 'Em execução',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
}

export const ROTULO_PRIORIDADE: Record<Prioridade, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
}

// sao as listas que ficam nos selects e na validação
export const ESTADOS: EstadoTarefa[] = ['backlog', 'aFazer', 'emExecucao', 'concluida', 'cancelada']
export const PRIORIDADES: Prioridade[] = ['baixa', 'media', 'alta']