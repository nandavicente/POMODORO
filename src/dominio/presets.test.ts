// teste das funçoes 8
import { describe, expect, it } from 'vitest'
import { atualizarPreset, criarPreset, presetEmUso } from './presets'
import type { SessaoAtiva } from './tipos'

describe('presets', () => {
  it('cria preset com id e tira os espaços do nome', () => {
    const p = criarPreset({ nome: '  Estudo  ', tempoFocoMin: 50, tempoPausaCurtaMin: 10, ciclosAntesPausaLonga: 4, tempoPausaLongaMin: 20 }, 100)
    expect(p.id).toBeTruthy()
    expect(p.nome).toBe('Estudo')
    expect(p.criadoEm).toBe(100)
  })

  it('ao editar mantém o id e a data de criação', () => {
    const p = criarPreset({ nome: 'A', tempoFocoMin: 25, tempoPausaCurtaMin: 5, ciclosAntesPausaLonga: 4, tempoPausaLongaMin: 15 }, 100)
    const editado = atualizarPreset(p, { nome: 'B', tempoFocoMin: 30, tempoPausaCurtaMin: 5, ciclosAntesPausaLonga: 4, tempoPausaLongaMin: 15 }, 200)
    expect(editado.id).toBe(p.id)
    expect(editado.criadoEm).toBe(100)
    expect(editado.atualizadoEm).toBe(200)
    expect(editado.tempoFocoMin).toBe(30)
  })

  it('preset em uso pela sessão fica bloqueado (RN-01)', () => {
    const sessao = { presetId: 'x', status: 'emAndamento' } as SessaoAtiva
    expect(presetEmUso('x', sessao)).toBe(true)
    expect(presetEmUso('y', sessao)).toBe(false)
    expect(presetEmUso('x', null)).toBe(false)
  })
})