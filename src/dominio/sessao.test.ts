import { describe, expect, it } from 'vitest'
import { criarPreset } from './presets'
import { avancarPorTempo, iniciarSessao, pausar, pularFase, reiniciarCiclos, retomar, tempoRestanteMs } from './sessao'

const MINUTO = 60000

const preset = criarPreset({ nome: 'Teste', tempoFocoMin: 25, tempoPausaCurtaMin: 5, ciclosAntesPausaLonga: 2, tempoPausaLongaMin: 15 }, 0)

describe('sessão', () => {
  it('começa no foco, ciclo 1 (UC04)', () => {
    const s = iniciarSessao(preset, 1000)
    expect(s.faseAtual).toBe('foco')
    expect(s.cicloAtual).toBe(1)
    expect(s.fimFasePrevistoEm).toBe(1000 + 25 * MINUTO)
  })

  it('editar o preset depois não muda a sessão (RN-05)', () => {
    const s = iniciarSessao(preset, 0)
    preset.tempoFocoMin = 50 
    expect(s.snapshotPreset.tempoFocoMin).toBe(25)
    preset.tempoFocoMin = 25 
  })

  it('pausar guarda o tempo e retomar recalcula o fim (UC05)', () => {
    const s = iniciarSessao(preset, 0)
    const pausada = pausar(s, 10 * MINUTO)
    expect(pausada.tempoRestanteAoPausarMs).toBe(15 * MINUTO)
    const retomada = retomar(pausada, 100 * MINUTO)
    expect(retomada.fimFasePrevistoEm).toBe(115 * MINUTO)
    expect(tempoRestanteMs(retomada, 100 * MINUTO)).toBe(15 * MINUTO)
  })

  it('pular avança a fase sem contar ciclo (RN-03)', () => {
    let s = iniciarSessao(preset, 0)
    s = pularFase(s, 1 * MINUTO)
    expect(s.faseAtual).toBe('pausaCurta')
    expect(s.ciclosConcluidos).toBe(0)
    s = pularFase(s, 2 * MINUTO)
    expect(s.faseAtual).toBe('foco')
    expect(s.cicloAtual).toBe(2)
    s = pularFase(s, 3 * MINUTO)
    expect(s.faseAtual).toBe('pausaLonga')
    s = pularFase(s, 4 * MINUTO)
    expect(s.status).toBe('concluida') 
  })

  it('reiniciar volta pro foco do ciclo 1 (RN-04)', () => {
    let s = pularFase(pularFase(iniciarSessao(preset, 0), 1), 2)
    s = reiniciarCiclos(s, 5)
    expect(s.faseAtual).toBe('foco')
    expect(s.cicloAtual).toBe(1)
  })

  it('avança as fases que passaram do horário (RN-07)', () => {
    const s = iniciarSessao(preset, 0)
    // aqui tá simulando 32 minutos depois: 25 de foco + 5 de pausa + 2 do próximo foco
    const { sessao, fasesVencidas } = avancarPorTempo(s, 32 * MINUTO)
    expect(fasesVencidas).toBe(2)
    expect(sessao.faseAtual).toBe('foco')
    expect(sessao.cicloAtual).toBe(2)
    expect(sessao.ciclosConcluidos).toBe(1)
    expect(tempoRestanteMs(sessao, 32 * MINUTO)).toBe(23 * MINUTO)
  })

  it('conclui quando todas as fases passaram (RN-08)', () => {
    const s = iniciarSessao(preset, 0)
    const { sessao } = avancarPorTempo(s, 10000 * MINUTO)
    expect(sessao.status).toBe('concluida')
    expect(sessao.ciclosConcluidos).toBe(2)
  })

  it('sessão pausada não avança sozinha (RN-06)', () => {
    const pausada = pausar(iniciarSessao(preset, 0), MINUTO)
    expect(avancarPorTempo(pausada, 999 * MINUTO).sessao).toBe(pausada)
  })
})