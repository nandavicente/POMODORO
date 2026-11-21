import { Link } from "react-router-dom";
import { formatarTempo, tempoRestanteMs } from "../../dominio/sessao";
import { ROTULO_FASE } from "../../dominio/tipos";
import { useApp } from "../estado";
import "./Inicio.css";
import { useState } from "react";
import ModalConfirmacao from "../componentes/ModalConfirmacao";

export default function Inicio() {
  const {
    sessao,
    agora,
    pausarSessao,
    retomarSessao,
    pularSessao,
    reiniciarSessao,
    encerrarSessao,
    presets,
    retomada,
    conclusao,
    iniciar,
    continuarRetomada,
    descartarSessaoSalva,
    fecharConclusao,
  } = useApp();

  const [confirmacao, setConfirmacao] = useState<
    "reiniciar" | "encerrar" | "descartar" | null
  >(null);

  const mensagensConfirmacao = {
    reiniciar: {
      titulo: "Reiniciar ciclos",
      mensagem:
        "Deseja reiniciar os ciclos? A sessão voltará ao foco do ciclo 1, com o tempo completo e o mesmo temporizador.",
      botao: "Reiniciar ciclos",
    },
    encerrar: {
      titulo: "Encerrar sessão",
      mensagem:
        "Deseja encerrar a sessão? O progresso atual será removido e o temporizador ficará disponível para edição e exclusão.",
      botao: "Encerrar sessão",
    },
    descartar: {
      titulo: "Descartar sessão recuperada",
      mensagem:
        "Deseja descartar a sessão recuperada? Ela será removida e o temporizador ficará disponível para edição e exclusão.",
      botao: "Descartar sessão",
    },
  };

  const mensagemAtual = confirmacao ? mensagensConfirmacao[confirmacao] : null;

  function confirmarAcao() {
    if (confirmacao === "reiniciar") {
      reiniciarSessao();
    } else if (confirmacao === "encerrar") {
      encerrarSessao();
    } else if (confirmacao === "descartar") {
      descartarSessaoSalva();
    }

    setConfirmacao(null);
  }

  if (conclusao) {
  const presetExiste = presets.some(
    (preset) => preset.id === conclusao.presetId,
  )

  return (
    <main className="inicio">
      <h1>Sessão concluída!</h1>

      <section className="sessao" aria-label="Resumo da sessão">
        <h2>{conclusao.nomePreset}</h2>

        <p>
          Focos concluídos: {conclusao.ciclosConcluidos} de{' '}
          {conclusao.totalCiclos}.
        </p>

        <p>O temporizador está liberado para edição e exclusão.</p>

        {presetExiste && (
          <div className="sessao-controles">
            <button
              type="button"
              onClick={() => iniciar(conclusao.presetId)}
            >
              Iniciar nova sessão
            </button>
          </div>
        )}
      </section>

      <Link to="/temporizadores" onClick={fecharConclusao}>
        Ver temporizadores
      </Link>
    </main>
  )
}

  if (!sessao) {
    return (
      <main className="inicio">
        <h1>Sessão de foco</h1>
        
        <p>Escolha um temporizador para começar.</p>
        <Link to="/temporizadores">Ver temporizadores</Link>
      </main>
    );
  }

  

  const tempoFormatado = formatarTempo(tempoRestanteMs(sessao, agora));

  return (
    <main className="inicio">
      <h1>{sessao.snapshotPreset.nome}</h1>

      {retomada && (
        <section className="inicio-aviso" aria-label="Sessão recuperada">
          <h2>Bem-vindo de volta!</h2>

          <p>
            {sessao.status === "pausada"
              ? "Sua sessão foi recuperada e continua pausada, com o tempo restante preservado."
              : "Sua sessão foi recuperada. A fase e o tempo restante foram recalculados pelo tempo decorrido."}
          </p>

          <div className="sessao-controles">
            <button type="button" onClick={continuarRetomada}>
              Continuar
            </button>

            <button type="button" onClick={() => setConfirmacao("descartar")}>
              Descartar sessão
            </button>
          </div>
        </section>
      )}

      <section className="sessao" aria-label="Sessão atual">
        <h2>{ROTULO_FASE[sessao.faseAtual]}</h2>

        <p>
          Ciclo {sessao.cicloAtual} de{" "}
          {sessao.snapshotPreset.ciclosAntesPausaLonga}
        </p>

        <p className="sessao-tempo" role="timer" aria-label="Tempo restante">
          {tempoFormatado}
        </p>

        <p>{sessao.status === "pausada" ? "Sessão pausada" : "Em andamento"}</p>

        <div className="sessao-controles">
          {sessao.status === "pausada" ? (
            <button type="button" onClick={retomarSessao}>
              Retomar
            </button>
          ) : (
            <button type="button" onClick={pausarSessao}>
              Pausar
            </button>
          )}

          <button type="button" onClick={pularSessao}>
            Pular fase
          </button>

          <button type="button" onClick={() => setConfirmacao("reiniciar")}>
            Reiniciar ciclos
          </button>

          <button type="button" onClick={() => setConfirmacao("encerrar")}>
            Encerrar sessão
          </button>
        </div>
      </section>

      <Link to="/temporizadores">Gerenciar temporizadores</Link>

      <ModalConfirmacao
        aberto={confirmacao !== null}
        titulo={mensagemAtual?.titulo ?? ''}
        mensagem={mensagemAtual?.mensagem ?? ''}
        textoConfirmar={mensagemAtual?.botao ?? 'Confirmar'}
        aoConfirmar={confirmarAcao}
        aoCancelar={() => setConfirmacao(null)}
      />
    </main>
  );
}
