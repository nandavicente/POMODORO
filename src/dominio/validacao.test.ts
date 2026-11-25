// testando as validações da seção 7
import { describe, expect, it } from 'vitest'
import { semErros, validarPreset, validarTarefa } from './validacao'

describe('validações', () => {
  it('aceita um preset válido', () => {
    const erros = validarPreset({ nome: 'Clássico', tempoFocoMin: 25, tempoPausaCurtaMin: 5, ciclosAntesPausaLonga: 4, tempoPausaLongaMin: 15 })
    expect(semErros(erros)).toBe(true)
  })

  it('rejeita valores fora dos limites (VR-01 a VR-05)', () => {
    const erros = validarPreset({ nome: '', tempoFocoMin: 121, tempoPausaCurtaMin: 0, ciclosAntesPausaLonga: 13, tempoPausaLongaMin: 1.5 })
    expect(Object.keys(erros).length).toBe(5)
  })

  it('rejeita nome com mais de 40 caracteres', () => {
    const erros = validarPreset({ nome: 'a'.repeat(41), tempoFocoMin: 25, tempoPausaCurtaMin: 5, ciclosAntesPausaLonga: 4, tempoPausaLongaMin: 15 })
    expect(erros.nome).toBeTruthy()
  })

  it('rejeita tarefa sem título (VR-06)', () => {
    const erros = validarTarefa({ titulo: '   ', estado: 'backlog', prioridade: 'media' })
    expect(erros.titulo).toBeTruthy()
  })

  it('aceita tarefa válida', () => {
    const erros = validarTarefa({ titulo: 'Revisar capítulo 3', estado: 'aFazer', prioridade: 'alta' })
    expect(semErros(erros)).toBe(true)
  })
})
