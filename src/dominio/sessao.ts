//  regra (UC04 até UC10)
// o tempo é sempre calculado pelo horário (timestamp) 
import { novoId } from './id'
import type { Fase, Preset, SessaoAtiva } from './tipos'

const MINUTO = 60000 // aqui tá 1 minuto em milissegundos

//  pegando quanto tempo dura cada fase, usando a cópia do preset
export function duracaoFaseMs(sessao: Pick<SessaoAtiva, 'snapshotPreset'>, fase: Fase): number {
  const p = sessao.snapshotPreset
  if (fase === 'foco') return p.tempoFocoMin * MINUTO
  if (fase === 'pausaCurta') return p.tempoPausaCurtaMin * MINUTO
  return p.tempoPausaLongaMin * MINUTO
}

export function proximaFase(fase: Fase, ciclo: number, totalCiclos: number): { fase: Fase; ciclo: number } | null {
  if (fase === 'foco') {
    if (ciclo < totalCiclos) return { fase: 'pausaCurta', ciclo }
    return { fase: 'pausaLonga', ciclo }
  }
  if (fase === 'pausaCurta') return { fase: 'foco', ciclo: ciclo + 1 }
  return null
}

//  sessão (UC04)
// começa no foco, ciclo 1, e faz a cópia dos tempos do preset (RN-05)
export function iniciarSessao(preset: Preset, agora = Date.now()): SessaoAtiva {
  const copia = {
    nome: preset.nome,
    tempoFocoMin: preset.tempoFocoMin,
    tempoPausaCurtaMin: preset.tempoPausaCurtaMin,
    ciclosAntesPausaLonga: preset.ciclosAntesPausaLonga,
    tempoPausaLongaMin: preset.tempoPausaLongaMin,
  }
  return {
    id: novoId(),
    presetId: preset.id,
    snapshotPreset: copia,
    faseAtual: 'foco',
    cicloAtual: 1,
    ciclosConcluidos: 0,
    status: 'emAndamento',
    inicioFaseEm: agora,
    fimFasePrevistoEm: agora + copia.tempoFocoMin * MINUTO, // aqui tá calculando quando o foco acaba
    pausadaEm: null,
    tempoRestanteAoPausarMs: null,
    criadaEm: agora,
    atualizadaEm: agora,
  }
}

// quanto tempo falta na fase atual
export function tempoRestanteMs(sessao: SessaoAtiva, agora = Date.now()): number {
  if (sessao.status === 'concluida') return 0
  if (sessao.status === 'pausada') return sessao.tempoRestanteAoPausarMs ?? 0
  return Math.max(0, sessao.fimFasePrevistoEm - agora)
}

// guarda quanto tempo faltava (UC05)
export function pausar(sessao: SessaoAtiva, agora = Date.now()): SessaoAtiva {
  if (sessao.status !== 'emAndamento') return sessao
  return {
    ...sessao,
    status: 'pausada',
    pausadaEm: agora,
    tempoRestanteAoPausarMs: Math.max(0, sessao.fimFasePrevistoEm - agora),
    atualizadaEm: agora,
  }
}

//  fim da fase é recalculado a partir de agora (UC05)
export function retomar(sessao: SessaoAtiva, agora = Date.now()): SessaoAtiva {
  if (sessao.status !== 'pausada') return sessao
  const duracao = duracaoFaseMs(sessao, sessao.faseAtual)
  const restante = sessao.tempoRestanteAoPausarMs ?? duracao
  return {
    ...sessao,
    status: 'emAndamento',
    inicioFaseEm: agora - (duracao - restante),
    fimFasePrevistoEm: agora + restante,
    pausadaEm: null,
    tempoRestanteAoPausarMs: null,
    atualizadaEm: agora,
  }
}

//  a nova fase também começa pausada com o tempo cheio
function entrarNaFase(sessao: SessaoAtiva, fase: Fase, ciclo: number, inicio: number, agora: number): SessaoAtiva {
  const duracao = duracaoFaseMs(sessao, fase)
  const nova = {
    ...sessao,
    faseAtual: fase,
    cicloAtual: ciclo,
    inicioFaseEm: inicio,
    fimFasePrevistoEm: inicio + duracao,
    atualizadaEm: agora,
  }
  if (sessao.status === 'pausada') {
    return { ...nova, pausadaEm: agora, tempoRestanteAoPausarMs: duracao }
  }
  return nova
}

function concluir(sessao: SessaoAtiva, agora: number): SessaoAtiva {
  return { ...sessao, status: 'concluida', pausadaEm: null, tempoRestanteAoPausarMs: null, atualizadaEm: agora }
}

// aqui tá pulando a fase (UC06)
// vai pra próxima fase mas NÃO conta o ciclo como concluído (RN-03)
// se estiver na última fase, a sessão acaba
export function pularFase(sessao: SessaoAtiva, agora = Date.now()): SessaoAtiva {
  if (sessao.status === 'concluida') return sessao
  const proxima = proximaFase(sessao.faseAtual, sessao.cicloAtual, sessao.snapshotPreset.ciclosAntesPausaLonga)
  if (!proxima) return concluir(sessao, agora)
  return entrarNaFase(sessao, proxima.fase, proxima.ciclo, agora, agora)
}

//  (UC07): volta pro foco do ciclo 1 e mantém o preset (RN-04)
export function reiniciarCiclos(sessao: SessaoAtiva, agora = Date.now()): SessaoAtiva {
  return {
    ...sessao,
    faseAtual: 'foco',
    cicloAtual: 1,
    ciclosConcluidos: 0,
    status: 'emAndamento',
    inicioFaseEm: agora,
    fimFasePrevistoEm: agora + duracaoFaseMs(sessao, 'foco'),
    pausadaEm: null,
    tempoRestanteAoPausarMs: null,
    atualizadaEm: agora,
  }
}

export interface ResultadoAvanco {
  sessao: SessaoAtiva
  fasesVencidas: number
}

//  (RN-07, RN-08, RN-13)
// serve tanto pro timer normal quanto pra quando o navegador fica fechado
// cada fase nova começa exatamente no horário em que a anterior acabou
export function avancarPorTempo(sessao: SessaoAtiva, agora = Date.now()): ResultadoAvanco {
  if (sessao.status !== 'emAndamento') return { sessao, fasesVencidas: 0 }

  let atual = sessao
  let fasesVencidas = 0

  while (atual.status === 'emAndamento' && agora >= atual.fimFasePrevistoEm) {
    fasesVencidas++
    const fimAnterior = atual.fimFasePrevistoEm

    let ciclosConcluidos = atual.ciclosConcluidos
    if (atual.faseAtual === 'foco') ciclosConcluidos++

    const proxima = proximaFase(atual.faseAtual, atual.cicloAtual, atual.snapshotPreset.ciclosAntesPausaLonga)
    if (!proxima) {
      // (RN-08)
      atual = concluir({ ...atual, ciclosConcluidos }, agora)
      break
    }
    atual = entrarNaFase({ ...atual, ciclosConcluidos }, proxima.fase, proxima.ciclo, fimAnterior, agora)
  }

  return { sessao: atual, fasesVencidas }
}

//  (R-03)
export function sessaoValida(valor: unknown): valor is SessaoAtiva {
  if (!valor || typeof valor !== 'object') return false
  const s = valor as Record<string, any>
  const ehNumero = (x: unknown) => typeof x === 'number' && Number.isFinite(x)

  if (typeof s.id !== 'string' || typeof s.presetId !== 'string') return false

  const copia = s.snapshotPreset
  if (!copia || typeof copia !== 'object') return false
  const camposTempo = ['tempoFocoMin', 'tempoPausaCurtaMin', 'ciclosAntesPausaLonga', 'tempoPausaLongaMin']
  for (const campo of camposTempo) {
    if (!ehNumero(copia[campo]) || copia[campo] < 1) return false
  }

  if (!['foco', 'pausaCurta', 'pausaLonga'].includes(s.faseAtual)) return false
  if (!['emAndamento', 'pausada', 'concluida'].includes(s.status)) return false
  if (!ehNumero(s.cicloAtual) || s.cicloAtual < 1 || s.cicloAtual > copia.ciclosAntesPausaLonga) return false
  if (!ehNumero(s.inicioFaseEm) || !ehNumero(s.fimFasePrevistoEm)) return false
  if (s.status === 'pausada' && !ehNumero(s.tempoRestanteAoPausarMs)) return false

  if (s.ciclosConcluidos === undefined) s.ciclosConcluidos = 0
  return true
}

export function formatarTempo(ms: number): string {
  const totalSegundos = Math.ceil(ms / 1000)
  const minutos = Math.floor(totalSegundos / 60)
  const segundos = totalSegundos % 60
  return String(minutos).padStart(2, '0') + ':' + String(segundos).padStart(2, '0')
}