import { Link } from "react-router-dom";
import { formatarTempo, tempoRestanteMs } from "../../dominio/sessao";
import { ROTULO_FASE } from "../../dominio/tipos";
import { useApp } from "../estado";
import "./Inicio.css";

export default function Inicio() {
  const { sessao, agora } = useApp()
  if (!sessao) {
    return (
      <main className="inicio">
        <h1>Sessão de foco</h1>
        <p>Escolha um temporizador para começar.</p>
        <Link to="/temporizadores">Ver temporizadores</Link>
      </main>
    )
  }

  const tempoFormatado = formatarTempo(
    tempoRestanteMs(sessao, agora),
  )

  return (
    <main className="inicio">
      <h1>{sessao.snapshotPreset.nome}</h1>

      <section className="sessao" aria-label="Sessão atual">
        <h2>{ROTULO_FASE[sessao.faseAtual]}</h2>

        <p>
          Ciclo {sessao.cicloAtual} de{' '}
          {sessao.snapshotPreset.ciclosAntesPausaLonga}
        </p>

        <p className="sessao-tempo" role="timer" aria-label="Tempo restante">
          {tempoFormatado}
        </p>

        <p>
          {sessao.status === 'pausada' ? 'Sessão pausada' : 'Em andamento'}
        </p>
      </section>

      <Link to="/temporizadores">Gerenciar temporizadores</Link>
    </main>
  )
}

