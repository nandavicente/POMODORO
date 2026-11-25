import { Link, useNavigate } from "react-router-dom";
import { presetEmUso, resumoPreset } from "../../dominio/presets";
import { useApp } from "../estado";
import "./Temporizadores.css";
import { useState } from "react";
import Modal from "../componentes/Modal";
import FormularioPreset from "../componentes/FormularioPreset";
import type { DadosPreset, Preset } from "../../dominio/tipos";
import ModalConfirmacao from "../componentes/ModalConfirmacao";

export default function Temporizadores() {
  const {
    presets,
    sessao,
    salvarNovoPreset,
    salvarEdicaoPreset,
    excluirPreset,
    iniciar,
    trocarPreset,
  } = useApp();
  const [modalAberto, setModalAberto] = useState(false);
  const [presetEmEdicao, setPresetEmEdicao] = useState<Preset | null>(null); // aq pode guardar um preset ou nenhum
  const [erroOperacao, setErroOperacao] = useState("");
  const [presetParaExcluir, setPresetParaExcluir] = useState<Preset | null>(
    null,
  );
  const [erroExclusao, setErroExclusao] = useState("");
  const navegar = useNavigate();

  function usarPreset(preset: Preset) {
    if (!presetEmUso(preset.id, sessao)) {
      if (sessao) {
        trocarPreset(preset.id);
      } else {
        iniciar(preset.id);
      }
    }

    navegar("/");
  }

  function abrirNovo() {
    setPresetEmEdicao(null);
    setErroOperacao("");
    setModalAberto(true);
  }

  function abrirEdicao(preset: Preset) {
    if (presetEmUso(preset.id, sessao)) return;

    setPresetEmEdicao(preset);
    setErroOperacao("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setPresetEmEdicao(null);
    setErroOperacao("");
  }

  function salvar(dados: DadosPreset) {
    if (presetEmEdicao) {
      const salvou = salvarEdicaoPreset(presetEmEdicao.id, dados);

      if (!salvou) {
        setErroOperacao(
          "Este temporizador está em uso. Encerre a sessão antes de editá-lo!",
        );
        return;
      }
    } else {
      salvarNovoPreset(dados);
    }
    fecharModal();
  } //aq escolhe a operacao com preset delecionado, edita; sem preset selecionado, cria.
  // a atualizacao existente preserva o id e a data de cricao

  function solicitarExclusao(preset: Preset) {
    if (presetEmUso(preset.id, sessao)) return;

    setErroExclusao("");
    setPresetParaExcluir(preset);
  }

  function cancelarExclusao() {
    setPresetParaExcluir(null);
    setErroExclusao("");
  }

  function confirmarExclusao() {
    if (!presetParaExcluir) return;

    const excluiu = excluirPreset(presetParaExcluir.id);

    if (!excluiu) {
      setErroExclusao(
        "Este temporizador está em uso. Encerre a sessão antes de excluí-lo!",
      );
      return;
    }

    cancelarExclusao();
  }

  return (
    <main className="temporizadores">
      <h1>Temporizadores</h1>
      <p>Organize suas configurações de foco e pausa</p>

      <button type="button" onClick={abrirNovo}  className="botao-novo-temporizador">
        + Novo temporizador
      </button>

      {sessao && (
        <p className="temporizador-aviso">
          Usar outro temporizador encerra a sessão atual e inicia uma nova!
        </p>
      )}

      <Modal
        aberto={modalAberto}
        titulo={presetEmEdicao ? "Editar temporizador" : "Novo temporizador"}
        aoFechar={fecharModal}
      >
        {erroOperacao && <p role="alert">{erroOperacao}</p>}

        {modalAberto && (
          <FormularioPreset
            key={presetEmEdicao?.id ?? "novo"} // faz o react criar um novo fomulario se mudar o item editado, isso vai evitar reaproveitar campos de outro preset
            dadosIniciais={presetEmEdicao ?? undefined} //quando recebe undefined o formulario usa PRESET_SUGERIDO
            aoSalvar={salvar}
            aoCancelar={fecharModal}
          />
        )}
      </Modal>

      {presets.length === 0 ? (
        <section className="temporizadores-vazio">
          <h2>Nenhum temporizador cadastrado</h2>
          <p>Crie uma configuração para começar suas sessões de foco</p>
        </section>
      ) : (
        <ul className="temporizadores-lista">
          {presets.map((preset) => {
            const emUso = presetEmUso(preset.id, sessao);

            return (
              <li key={preset.id} className="temporizador-card">
                <div className="temporizador-titulo">
                  <h2>{preset.nome}</h2>

                  <span className="temporizador-status">
                    {emUso ? "Em uso" : "Livre"}
                  </span>
                </div>

                <p>{resumoPreset(preset)}</p>

                <div className="temporizador-acoes">
                  <button
                    type="button"
                    onClick={() => usarPreset(preset)}
                    aria-label={
                      emUso
                        ? `Ver sessão de ${preset.nome}`
                        : `Usar temporizador ${preset.nome}`
                    }
                  >
                    {emUso ? "Ver sessão" : "Usar temporizador"}
                  </button>

                  <button
                    type="button"
                    disabled={emUso}
                    onClick={() => abrirEdicao(preset)}
                    aria-label={`Editar temporizador ${preset.nome}`}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    disabled={emUso}
                    onClick={() => solicitarExclusao(preset)}
                    aria-label={`Excluir temporizador ${preset.nome}`}
                  >
                    Excluir
                  </button>
                </div>

                {emUso && (
                  <p className="temporizador-aviso">
                    Para editar ou excluir este temporizador,{" "}
                    <Link to="/">encerre a sessão ativa no Início</Link>.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <ModalConfirmacao
        aberto={presetParaExcluir !== null}
        titulo="Excluir temporizador"
        mensagem={`Deseja excluir o temporizador "${presetParaExcluir?.nome ?? ""}"? Essa ação não pode ser desfeita.`}
        textoConfirmar="Excluir temporizador"
        erro={erroExclusao}
        aoConfirmar={confirmarExclusao}
        aoCancelar={cancelarExclusao}
      />
    </main>
  );
}
