import { ESTADOS, PRIORIDADES } from './tipos'
import type { DadosPreset, DadosTarefa } from './tipos'

export type Erros<T> = Partial<Record<keyof T, string>>

// conferindo se o número é inteiro e está dentro do limite
function inteiroEntre(valor: number, min: number, max: number): boolean {
  return Number.isInteger(valor) && valor >= min && valor <= max
}

// preset (VR-01 até VR-05)
export function validarPreset(dados: DadosPreset): Erros<DadosPreset> {
  const erros: Erros<DadosPreset> = {}
  const nome = (dados.nome || '').trim() // tirando os espaços do começo e do fim

  if (nome.length < 1 || nome.length > 40) {
    erros.nome = 'O nome deve ter entre 1 e 40 caracteres.'
  }
  if (!inteiroEntre(dados.tempoFocoMin, 1, 120)) {
    erros.tempoFocoMin = 'Informe um número inteiro de 1 a 120 min.'
  }
  if (!inteiroEntre(dados.tempoPausaCurtaMin, 1, 60)) {
    erros.tempoPausaCurtaMin = 'Informe um número inteiro de 1 a 60 min.'
  }
  if (!inteiroEntre(dados.ciclosAntesPausaLonga, 1, 12)) {
    erros.ciclosAntesPausaLonga = 'Informe um número inteiro de 1 a 12 ciclos.'
  }
  if (!inteiroEntre(dados.tempoPausaLongaMin, 1, 60)) {
    erros.tempoPausaLongaMin = 'Informe um número inteiro de 1 a 60 min.'
  }

  return erros
}

// tarefa (VR-06 até VR-08)
export function validarTarefa(dados: DadosTarefa): Erros<DadosTarefa> {
  const erros: Erros<DadosTarefa> = {}
  const titulo = (dados.titulo || '').trim()

  if (titulo.length < 1 || titulo.length > 100) {
    erros.titulo = 'Informe um título entre 1 e 100 caracteres.'
  }
  if (!ESTADOS.includes(dados.estado)) {
    erros.estado = 'Escolha um estado válido.'
  }
  if (!PRIORIDADES.includes(dados.prioridade)) {
    erros.prioridade = 'Escolha uma prioridade válida.'
  }

  return erros
}

export function semErros(erros: object): boolean {
  return Object.keys(erros).length === 0
}