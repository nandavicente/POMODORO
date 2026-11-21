import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { atualizarPreset, criarPreset } from '../dominio/presets'
import { avancarPorTempo, iniciarSessao, pausar, pularFase, reiniciarCiclos, retomar } from '../dominio/sessao'
import { atualizarTarefa, criarTarefa, ordenarTarefas } from '../dominio/tarefas'
import { ROTULO_FASE } from '../dominio/tipos'
import type { DadosPreset, DadosTarefa, Preset, SessaoAtiva, Tarefa } from '../dominio/tipos'
import * as armazenamento from '../persistencia/armazenamento'
import { liberarAudio, tocarAlerta } from './audio/som'

// (SE3)
export interface InfoConclusao {
  nomePreset: string
  presetId: string
  ciclosConcluidos: number
  totalCiclos: number
}

interface Estado {
  agora: number
  presets: Preset[]
  tarefas: Tarefa[]
  sessao: SessaoAtiva | null
  retomada: boolean //  (SE4)
  sessaoInvalida: boolean // (R-03)
  conclusao: InfoConclusao | null //  (SE3)
  erroPersistencia: string | null //  (RNF-06)
  aviso: string //  (RNF-05)

  salvarNovoPreset: (dados: DadosPreset) => Preset | null
  salvarEdicaoPreset: (id: string, dados: DadosPreset) => boolean
  excluirPreset: (id: string) => boolean

  iniciar: (presetId: string) => void
  trocarPreset: (presetId: string) => void
  pausarSessao: () => void
  retomarSessao: () => void
  pularSessao: () => void
  reiniciarSessao: () => void
  encerrarSessao: () => void
  continuarRetomada: () => void
  descartarSessaoSalva: () => void
  fecharConclusao: () => void

  salvarNovaTarefa: (dados: DadosTarefa) => void
  salvarEdicaoTarefa: (id: string, dados: DadosTarefa) => void
  excluirTarefa: (id: string) => void
  fecharErro: () => void
}

const Contexto = createContext<Estado | null>(null)

// aqui tá o hook que as telas usam pra pegar o estado
export function useApp(): Estado {
  const valor = useContext(Contexto)
  if (!valor) throw new Error('useApp precisa estar dentro do AppProvider')
  return valor
}

function infoDe(sessao: SessaoAtiva): InfoConclusao {
  return {
    nomePreset: sessao.snapshotPreset.nome,
    presetId: sessao.presetId,
    ciclosConcluidos: sessao.ciclosConcluidos,
    totalCiclos: sessao.snapshotPreset.ciclosAntesPausaLonga,
  }
}

interface Inicial {
  sessao: SessaoAtiva | null
  retomada: boolean
  invalida: boolean
  conclusao: InfoConclusao | null
}

// (UC10)
//  (RN-06, RN-07, RN-08)
function carregarInicial(): Inicial {
  const leitura = armazenamento.carregarSessao()

  if (leitura.tipo === 'ausente') {
    return { sessao: null, retomada: false, invalida: false, conclusao: null }
  }
  if (leitura.tipo === 'invalida') {
    return { sessao: null, retomada: false, invalida: true, conclusao: null }
  }

  const { sessao } = avancarPorTempo(leitura.sessao, Date.now())

  if (sessao.status === 'concluida') {
    try {
      armazenamento.salvarSessao(null)
    } catch {
    }
    return { sessao: null, retomada: false, invalida: false, conclusao: infoDe(sessao) }
  }

  try {
    armazenamento.salvarSessao(sessao)
  } catch {
  }
  return { sessao, retomada: true, invalida: false, conclusao: null }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const inicial = useRef<Inicial | null>(null)
  if (!inicial.current) inicial.current = carregarInicial()

  const [presets, setPresets] = useState<Preset[]>(() => armazenamento.carregarPresets())
  const [tarefas, setTarefas] = useState<Tarefa[]>(() => ordenarTarefas(armazenamento.carregarTarefas()))
  const [sessao, setSessao] = useState<SessaoAtiva | null>(inicial.current.sessao)
  const [retomada, setRetomada] = useState(inicial.current.retomada)
  const [sessaoInvalida, setSessaoInvalida] = useState(inicial.current.invalida)
  const [conclusao, setConclusao] = useState<InfoConclusao | null>(inicial.current.conclusao)
  const [erroPersistencia, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState('')
  const [agora, setAgora] = useState(() => Date.now())

  // (RNF-06)
  const persistir = useCallback((acao: () => void) => {
    try {
      acao()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao salvar no Local Storage.')
    }
  }, [])

  // (RNF-04)
  const gravarSessao = useCallback(
    (nova: SessaoAtiva | null) => {
      if (nova && nova.status === 'concluida') {
        setConclusao(infoDe(nova))
        setSessao(null)
        persistir(() => armazenamento.salvarSessao(null))
        return
      }
      setSessao(nova)
      persistir(() => armazenamento.salvarSessao(nova))
    },
    [persistir],
  )

  // (RNF-03)
  useEffect(() => {
    const id = window.setInterval(() => setAgora(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [])

  // (RN-13)
  useEffect(() => {
    if (!sessao || sessao.status !== 'emAndamento') return
    if (agora < sessao.fimFasePrevistoEm) return

    const { sessao: nova, fasesVencidas } = avancarPorTempo(sessao, agora)
    if (fasesVencidas > 0) {
      tocarAlerta()
      if (nova.status === 'concluida') {
        setAviso('Sessão concluída.')
      } else {
        setAviso(`Fase concluída. Agora: ${ROTULO_FASE[nova.faseAtual]}, ciclo ${nova.cicloAtual}.`)
      }
    }
    gravarSessao(nova)
  }, [agora, sessao, gravarSessao])

  const salvarListaPresets = useCallback(
    (lista: Preset[]) => {
      setPresets(lista)
      persistir(() => armazenamento.salvarPresets(lista))
    },
    [persistir],
  )

  const salvarListaTarefas = useCallback(
    (lista: Tarefa[]) => {
      const ordenada = ordenarTarefas(lista)
      setTarefas(ordenada)
      persistir(() => armazenamento.salvarTarefas(ordenada))
    },
    [persistir],
  )

  const emUso = (id: string) => !!sessao && sessao.presetId === id

  const valor: Estado = {
    agora,
    presets,
    tarefas,
    sessao,
    retomada,
    sessaoInvalida,
    conclusao,
    erroPersistencia,
    aviso,

    salvarNovoPreset: (dados) => {
      const novo = criarPreset(dados)
      salvarListaPresets([...presets, novo])
      return novo
    },
    salvarEdicaoPreset: (id, dados) => {
      if (emUso(id)) return false 
      salvarListaPresets(presets.map((p) => (p.id === id ? atualizarPreset(p, dados) : p)))
      return true
    },
    excluirPreset: (id) => {
      if (emUso(id)) return false 
      salvarListaPresets(presets.filter((p) => p.id !== id))
      return true
    },

    iniciar: (presetId) => {
      const preset = presets.find((p) => p.id === presetId)
      if (!preset) return
      liberarAudio() 
      setConclusao(null)
      setRetomada(false)
      gravarSessao(iniciarSessao(preset))
    },
    trocarPreset: (presetId) => {
      // aqui tá a RN-02: encerra a sessão atual sem confirmar e começa outra
      const preset = presets.find((p) => p.id === presetId)
      if (!preset) return
      liberarAudio()
      setRetomada(false)
      setConclusao(null)
      gravarSessao(iniciarSessao(preset))
    },
    pausarSessao: () => {
      if (!sessao) return
      setRetomada(false)
      gravarSessao(pausar(sessao))
    },
    retomarSessao: () => {
      if (!sessao) return
      liberarAudio()
      setRetomada(false)
      gravarSessao(retomar(sessao))
    },
    pularSessao: () => {
      if (!sessao) return
      setRetomada(false)
      const nova = pularFase(sessao)
      if (nova.status === 'concluida') {
        setAviso('Sessão concluída.')
      } else {
        setAviso(`Fase pulada. Agora: ${ROTULO_FASE[nova.faseAtual]}, ciclo ${nova.cicloAtual}.`)
      }
      gravarSessao(nova)
    },
    reiniciarSessao: () => {
      if (!sessao) return
      setRetomada(false)
      gravarSessao(reiniciarCiclos(sessao))
    },
    encerrarSessao: () => {
      setRetomada(false)
      gravarSessao(null) 
    },
    continuarRetomada: () => {
      liberarAudio()
      setRetomada(false)
    },
    descartarSessaoSalva: () => {
      setRetomada(false)
      setSessaoInvalida(false)
      gravarSessao(null)
    },
    fecharConclusao: () => setConclusao(null),

    // ---------- tarefas ----------
    salvarNovaTarefa: (dados) => salvarListaTarefas([...tarefas, criarTarefa(dados)]),
    salvarEdicaoTarefa: (id, dados) =>
      salvarListaTarefas(tarefas.map((t) => (t.id === id ? atualizarTarefa(t, dados) : t))),
    excluirTarefa: (id) => salvarListaTarefas(tarefas.filter((t) => t.id !== id)),
    fecharErro: () => setErro(null),
  }

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}