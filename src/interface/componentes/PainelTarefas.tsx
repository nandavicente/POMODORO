import { useState } from "react";

import { useApp } from "../estado";

import {
  ROTULO_ESTADO,
  ROTULO_PRIORIDADE
} from "../../dominio/tipos";

import type {
  Tarefa,
  DadosTarefa
} from "../../dominio/tipos";

import FormularioTarefa from "./FormularioTarefa";
import Modal from "./Modal";
import ModalConfirmacao from "./ModalConfirmacao";

export default function PainelTarefas() {

  const {
    tarefas,
    salvarNovaTarefa,
    salvarEdicaoTarefa,
    excluirTarefa
  } = useApp();

  const [modalAberto, setModalAberto] = useState(false);

  const [tarefaEmEdicao, setTarefaEmEdicao] = useState<Tarefa | null>(null);

  const [tarefaParaExcluir, setTarefaParaExcluir] = useState<Tarefa | null>(null);

 function abrirNovaTarefa() {
    setTarefaEmEdicao(null);
    setModalAberto(true);
  }

  function abrirEdicao(tarefa: Tarefa) {
    setTarefaEmEdicao(tarefa);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setTarefaEmEdicao(null);
  }

  function salvar(dados: DadosTarefa) {
    if (tarefaEmEdicao) {
      salvarEdicaoTarefa(tarefaEmEdicao.id, dados);
    } else {
      salvarNovaTarefa(dados);
    }

    fecharModal();
  }

  function solicitarExclusao(tarefa: Tarefa) {
    setTarefaParaExcluir(tarefa);
  }

  function cancelarExclusao() {
    setTarefaParaExcluir(null);
  }

  function confirmarExclusao() {
    if (!tarefaParaExcluir) return;

    excluirTarefa(tarefaParaExcluir.id);

    setTarefaParaExcluir(null);
  }
    return (
    <aside className="painel-tarefas">

      <div className="painel-tarefas-cabecalho">

        <h2>Tarefas</h2>

        <button type="button" onClick={abrirNovaTarefa}>
          + Nova tarefa
        </button>

      </div>

      {tarefas.length === 0 ? (

        <p className="painel-tarefas-vazio">
          Nenhuma tarefa cadastrada.</p>

      ) : (

        <ul className="tarefas-lista">

          {tarefas.map((tarefa) => (

            <li key={tarefa.id} className="tarefa-card">

              <h3>{tarefa.titulo}</h3>

              <div className="tarefa-informacoes">

                <span className={`tarefa-estado ${tarefa.estado}`}>
                  {ROTULO_ESTADO[tarefa.estado]}</span>

                <span className={`tarefa-prioridade ${tarefa.prioridade}`}>
                  {ROTULO_PRIORIDADE[tarefa.prioridade]}</span>

              </div>

              <div className="tarefa-acoes">

                <button type="button" onClick={() => abrirEdicao(tarefa)}>
                  Editar 
                </button>

                <button type="button" onClick={() => solicitarExclusao(tarefa)}>
                  Excluir
                </button>

              </div>

            </li>

          ))}

        </ul>

      )}

    <Modal aberto={modalAberto}
        titulo={tarefaEmEdicao ? "Editar tarefa" : "Nova tarefa"}
        aoFechar={fecharModal}>

        {modalAberto && (
          <FormularioTarefa
            key={tarefaEmEdicao?.id ?? "nova"}
            dadosIniciais={tarefaEmEdicao ?? undefined}
            aoSalvar={salvar}
            aoCancelar={fecharModal}
          />
        )}

      </Modal>

      <ModalConfirmacao
        aberto={tarefaParaExcluir !== null}
        titulo="Excluir tarefa"
        mensagem={`Deseja excluir a tarefa "${tarefaParaExcluir?.titulo ?? ""}"? Essa ação não pode ser desfeita.`}
        textoConfirmar="Excluir tarefa"
        aoConfirmar={confirmarExclusao}
        aoCancelar={cancelarExclusao}
      />

    </aside>
  );
}