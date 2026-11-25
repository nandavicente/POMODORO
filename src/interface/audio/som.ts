//  alerta sonoro do fim de fase (RF-14, RN-13) e o som ambiente opcional (OP1)
// tá usando a Web Audio API, então não precisa de arquivo de áudio
// o navegador só deixa tocar som depois que o usuário clica em algo (R-01, RNF-10)
let contextoAudio: AudioContext | null = null

function pegarContexto(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Construtor = window.AudioContext || (window as any).webkitAudioContext
  if (!Construtor) return null
  if (!contextoAudio) contextoAudio = new Construtor()
  return contextoAudio
}

export function liberarAudio(): void {
  const ctx = pegarContexto()
  if (ctx && ctx.state === 'suspended') ctx.resume()
}

export function tocarAlerta(): void {
  const ctx = pegarContexto()
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume()

  const inicio = ctx.currentTime
  const atrasos = [0, 0.28, 0.56]

  atrasos.forEach((atraso, i) => {
    const oscilador = ctx.createOscillator()
    const volume = ctx.createGain()
    oscilador.type = 'sine'
    oscilador.frequency.value = i === 2 ? 1046 : 880 

    volume.gain.setValueAtTime(0.0001, inicio + atraso)
    volume.gain.exponentialRampToValueAtTime(0.35, inicio + atraso + 0.02)
    volume.gain.exponentialRampToValueAtTime(0.0001, inicio + atraso + 0.25)

    oscilador.connect(volume)
    volume.connect(ctx.destination)
    oscilador.start(inicio + atraso)
    oscilador.stop(inicio + atraso + 0.26)
  })
}

export type SomAmbiente = 'desligado' | 'chuva' | 'ruidoMarrom'

export const ROTULO_SOM: Record<SomAmbiente, string> = {
  desligado: 'Desligado',
  chuva: 'Chuva',
  ruidoMarrom: 'Ruído marrom',
}

let fonteAtual: AudioBufferSourceNode | null = null

function gerarRuido(ctx: AudioContext, tipo: 'chuva' | 'ruidoMarrom'): AudioBuffer {
  const tamanho = ctx.sampleRate * 4
  const buffer = ctx.createBuffer(1, tamanho, ctx.sampleRate)
  const dados = buffer.getChannelData(0)
  let ultimo = 0

  for (let i = 0; i < tamanho; i++) {
    const aleatorio = Math.random() * 2 - 1
    if (tipo === 'ruidoMarrom') {
      ultimo = (ultimo + 0.02 * aleatorio) / 1.02
      dados[i] = ultimo * 3.5
    } else {
      const gota = Math.random() < 0.0008 ? (Math.random() - 0.5) * 2 : 0
      dados[i] = aleatorio * 0.5 + gota
    }
  }
  return buffer
}

export function definirSomAmbiente(tipo: SomAmbiente): void {
  // aqui tá parando o som que estava tocando antes
  if (fonteAtual) {
    fonteAtual.stop()
    fonteAtual.disconnect()
    fonteAtual = null
  }
  if (tipo === 'desligado') return

  const ctx = pegarContexto()
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume()

  const fonte = ctx.createBufferSource()
  fonte.buffer = gerarRuido(ctx, tipo)
  fonte.loop = true

  const filtro = ctx.createBiquadFilter()
  filtro.type = 'lowpass'
  filtro.frequency.value = tipo === 'chuva' ? 1800 : 600

  const volume = ctx.createGain()
  volume.gain.value = tipo === 'chuva' ? 0.12 : 0.25

  fonte.connect(filtro)
  filtro.connect(volume)
  volume.connect(ctx.destination)
  fonte.start()
  fonteAtual = fonte
}