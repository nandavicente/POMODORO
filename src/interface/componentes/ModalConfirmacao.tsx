import Modal from "./Modal";
import "./ModalConfirmacao.css";

interface ModalConfirmacaoProps {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  erro?: string;
  aoConfirmar: () => void;
  aoCancelar: () => void;
}

export default function ModalConfirmacao({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = "Confirmar",
  erro,
  aoConfirmar,
  aoCancelar,
}: ModalConfirmacaoProps) {
  return (
    <Modal aberto={aberto} titulo={titulo} aoFechar={aoCancelar}>
      <p>{mensagem}</p>

      {erro && (
        <p className="confirmacao-erro" role="alert">
          {erro}
        </p>
      )}

      <div className="confirmacao-acoes">
        <button type="button" onClick={aoCancelar} autoFocus> 
          Cancelar
        </button>

        <button
          type="button"
          className="confirmacao-confirmar"
          onClick={aoConfirmar}
        >
          {textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}
