import { useState } from "react";
import { Link } from "react-router-dom";
import { resumoPreset } from "../../dominio/presets";
import { formatarTempo, tempoRestanteMs } from "../../dominio/sessao";
import { ROTULO_FASE } from "../../dominio/tipos";
import type { DadosPreset } from "../../dominio/tipos";
import { definirSomAmbiente, ROTULO_SOM } from "../audio/som";
import type { SomAmbiente } from "../audio/som";
import FormularioPreset from "../componentes/FormularioPreset";
import Modal from "../componentes/Modal";
import ModalConfirmacao from "../componentes/ModalConfirmacao";
import { useApp } from "../estado";
import "./Inicio.css";
import PainelTarefas from "../componentes/PainelTarefas";

const OPCOES_SOM: SomAmbiente[] = ["desligado", "chuva", "ruidoMarrom"];

export default function Inicio() {
  const {
    sessao,
    agora,
    presets,
    retomada,
    conclusao,
    aviso,
    salvarNovoPreset,
    iniciar,
    trocarPreset,
    pausarSessao,
    retomarSessao,
    pularSessao,
    reiniciarSessao,
    encerrarSessao,
    continuarRetomada,
    descartarSessaoSalva,
    fecharConclusao,
  } = useApp();

  const [presetSelecionadoId, setPresetSelecionadoId] = useState<string>("");
  const [modalNovoPreset, setModalNovoPreset] = useState(false);
  const [somAmbiente, setSomAmbiente] = useState<SomAmbiente>("desligado");
  const [confirmacao, setConfirmacao] = useState<
    "reiniciar" | "encerrar" | "descartar" | null
  >(null);

  // Garante que sempre exista um preset válido selecionado quando há presets cadastrados
  const idSelecionadoEfetivo = presets.some((p) => p.id === presetSelecionadoId)
    ? presetSelecionadoId
    : (presets[0]?.id ?? "");

  const presetSelecionado = presets.find((p) => p.id === idSelecionadoEfetivo);

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
        "Deseja descartar a sessão recuperada? Ela será removida sem contabilizar progresso e o temporizador ficará disponível para edição e exclusão.",
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

  function aoCriarPrimeiroPreset(dados: DadosPreset) {
    const criado = salvarNovoPreset(dados);
    if (criado) {
      setPresetSelecionadoId(criado.id);
    }
    setModalNovoPreset(false);
  }

  function aoMudarSomAmbiente(novoSom: SomAmbiente) {
    setSomAmbiente(novoSom);
    definirSomAmbiente(novoSom);
  }

  function aoTrocarPresetNaSessao(novoId: string) {
    if (!sessao || novoId === sessao.presetId) return;
    trocarPreset(novoId);
  }

  const seletorSom = (
    <div className="inicio-som">
      <label htmlFor="seletor-som-ambiente">Som ambiente (opcional)</label>
      <select
        id="seletor-som-ambiente"
        value={somAmbiente}
        onChange={(e) => aoMudarSomAmbiente(e.currentTarget.value as SomAmbiente)}
      >
        {OPCOES_SOM.map((opcao) => (
          <option key={opcao} value={opcao}>
            {ROTULO_SOM[opcao]}
          </option>
        ))}
      </select>
    </div>
  );

  // SE3 - Sessão concluída
  if (conclusao) {
    const presetExiste = presets.some(
      (preset) => preset.id === conclusao.presetId,
    );

    return (
      <main className="inicio">
        <div className="inicio-principal">
          <h1>Sessão concluída!</h1>

          <section className="sessao" aria-label="Resumo da sessão">
            <h2>{conclusao.nomePreset}</h2>

            <p>
              Focos concluídos: {conclusao.ciclosConcluidos} de{" "}
              {conclusao.totalCiclos}.
            </p>

            <p>O temporizador está liberado para edição e exclusão.</p>

            <div className="sessao-controles">
              {presetExiste && (
                <button
                  type="button"
                  className="botao-primario"
                  onClick={() => iniciar(conclusao.presetId)}
                >
                  Iniciar nova sessão
                </button>
              )}

              <button type="button" onClick={fecharConclusao}>
                Voltar ao início
              </button>
            </div>
          </section>

          <Link to="/temporizadores" onClick={fecharConclusao}>
            Gerenciar temporizadores
          </Link>
        </div>
        <PainelTarefas />
      </main>
    );
  }

  // HO / SE1 - Sem sessão ativa
  if (!sessao) {
    return (
      <main className="inicio">
        <div className="inicio-principal">
          <h1>Sessão de foco</h1>

          {presets.length === 0 ? (
            <section className="sessao" aria-label="Primeiro uso">
              <h2>Nenhum temporizador cadastrado</h2>
              <p>
                Crie seu primeiro temporizador personalizado para iniciar seus
                ciclos de estudo.
              </p>

              <div className="sessao-controles">
                <button
                  type="button"
                  className="botao-primario"
                  onClick={() => setModalNovoPreset(true)}
                >
                  + Criar primeiro temporizador
                </button>
              </div>
            </section>
          ) : (
            <section className="sessao" aria-label="Seletor de temporizador">
              <div className="seletor-preset">
                <label htmlFor="seletor-preset-inicial">
                  Temporizador (preset)
                </label>

                <select
                  id="seletor-preset-inicial"
                  value={idSelecionadoEfetivo}
                  onChange={(e) =>
                    setPresetSelecionadoId(e.currentTarget.value)
                  }
                >
                  {presets.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.nome}
                    </option>
                  ))}
                </select>

                {presetSelecionado && (
                  <p className="seletor-resumo">
                    {resumoPreset(presetSelecionado)}
                  </p>
                )}
              </div>

              <div className="sessao-controles">
                <button
                  type="button"
                  className="botao-primario"
                  disabled={!idSelecionadoEfetivo}
                  onClick={() => iniciar(idSelecionadoEfetivo)}
                >
                  Iniciar sessão
                </button>
              </div>

              {seletorSom}
            </section>
          )}

          <Link to="/temporizadores">Gerenciar temporizadores</Link>
        </div>
        <PainelTarefas />
        <Modal
          aberto={modalNovoPreset}
          titulo="Novo temporizador"
          aoFechar={() => setModalNovoPreset(false)}
        >
          {modalNovoPreset && (
            <FormularioPreset
              aoSalvar={aoCriarPrimeiroPreset}
              aoCancelar={() => setModalNovoPreset(false)}
            />
          )}
        </Modal>
      </main>
    );
  }

  // SE2 / SE2.1 / SE4 - Sessão ativa (em andamento ou pausada)
  const tempoFormatado = formatarTempo(tempoRestanteMs(sessao, agora));

  return (
    <main className="inicio">
      <div className="inicio-principal">
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
              <button
                type="button"
                className="botao-primario"
                onClick={continuarRetomada}
              >
                Continuar
              </button>

              <button
                type="button"
                onClick={() => setConfirmacao("descartar")}
              >
                Descartar sessão
              </button>
            </div>
          </section>
        )}

        {aviso && (
          <p className="inicio-aviso-fase" role="status">
            {aviso}
          </p>
        )}

        <section className="sessao" aria-label="Sessão atual">
          {presets.length > 1 && (
            <div className="seletor-preset">
              <label htmlFor="seletor-preset-ativo">Trocar temporizador</label>

              <select
                id="seletor-preset-ativo"
                value={sessao.presetId}
                onChange={(e) => aoTrocarPresetNaSessao(e.currentTarget.value)}
              >
                {presets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.nome}
                  </option>
                ))}
              </select>

              <p className="seletor-nota">
                Trocar de temporizador encerra a sessão atual imediatamente e
                inicia uma nova.
              </p>
            </div>
          )}

          <p className="sessao-fase">{ROTULO_FASE[sessao.faseAtual]}</p>

          <p className="sessao-ciclo">
            Ciclo {sessao.cicloAtual} de{" "}
            {sessao.snapshotPreset.ciclosAntesPausaLonga} · Focos concluídos:{" "}
            {sessao.ciclosConcluidos}
          </p>

          <p className="sessao-tempo" role="timer" aria-label="Tempo restante">
            {tempoFormatado}
          </p>

          <p className="sessao-status">
            {sessao.status === "pausada" ? "Sessão pausada" : "Em andamento"}
          </p>

          <div className="sessao-controles">
            {sessao.status === "pausada" ? (
              <button
                type="button"
                className="botao-primario"
                onClick={retomarSessao}
              >
                Retomar
              </button>
            ) : (
              <button
                type="button"
                className="botao-primario"
                onClick={pausarSessao}
              >
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

          <p className="seletor-nota">
            Pular uma fase avança para a próxima sem contabilizar o ciclo como
            concluído.
          </p>

          {seletorSom}
        </section>

        <Link to="/temporizadores">Gerenciar temporizadores</Link>
      </div>
      <PainelTarefas />
      <ModalConfirmacao
        aberto={confirmacao !== null}
        titulo={mensagemAtual?.titulo ?? ""}
        mensagem={mensagemAtual?.mensagem ?? ""}
        textoConfirmar={mensagemAtual?.botao ?? "Confirmar"}
        aoConfirmar={confirmarAcao}
        aoCancelar={() => setConfirmacao(null)}
      />
    </main>
  );
}