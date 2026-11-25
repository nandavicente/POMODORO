import { novoId } from './id'
import type { DadosPreset, Preset, SessaoAtiva } from './tipos'

// os valores que já vêm preenchidos quando o usuário ainda não tem preset
export const PRESET_SUGERIDO: DadosPreset = {
  nome: 'Pomodoro Clássico',
  tempoFocoMin: 25,
  tempoPausaCurtaMin: 5,
  ciclosAntesPausaLonga: 4,
  tempoPausaLongaMin: 15,
}

// (UC01)
export function criarPreset(dados: DadosPreset, agora = Date.now()): Preset {
  return {
    ...dados,
    nome: dados.nome.trim(),
    id: novoId(),
    criadoEm: agora,
    atualizadoEm: agora,
  }
}

// preset que já existe (UC02), mantendo o id e a data de criação
export function atualizarPreset(preset: Preset, dados: DadosPreset, agora = Date.now()): Preset {
  return {
    ...preset,
    ...dados,
    nome: dados.nome.trim(),
    atualizadoEm: agora,
  }
}

// regra RN-01: se a sessão ativa estiver usando esse preset
export function presetEmUso(presetId: string, sessao: SessaoAtiva | null): boolean {
  if (!sessao) return false
  if (sessao.status === 'concluida') return false
  return sessao.presetId === presetId
}

export function resumoPreset(p: DadosPreset): string {
  return `Foco ${p.tempoFocoMin} min · Pausa curta ${p.tempoPausaCurtaMin} min · ${p.ciclosAntesPausaLonga} ciclos · Pausa longa ${p.tempoPausaLongaMin} min`
}