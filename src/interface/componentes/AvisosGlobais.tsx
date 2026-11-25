//aq exibe falhas ao salvar no navegador, oferece descarte confirmado de uma sessao invalida
//anuncia mudanças de fases
//atualiza o titulo da aba, por exemplo: 24:59 - Foco

import { useEffect, useState } from "react";
import { formatarTempo, tempoRestanteMs } from "../../dominio/sessao";
import { ROTULO_FASE } from "../../dominio/tipos";
import { useApp } from "../estado";
import ModalConfirmacao from "./ModalConfirmacao";
import "./AvisosGlobais.css";

export default function AvisosGlobais() {
  const {
    sessao,
    agora,
    erroPersistencia,
    fecharErro,
    sessaoInvalida,
    descartarSessaoSalva,
    aviso,
  } = useApp();

  const [confirmarDescarte, setConfirmarDescarte] = useState(false);

  const titulo = sessao
    ? `${formatarTempo(tempoRestanteMs(sessao, agora))} · ${
        ROTULO_FASE[sessao.faseAtual]
      }${sessao.status === "pausada" ? " · Pausada" : ""}`
    : "Pomodoro Focus";

  useEffect(() => {
    document.title = titulo;
  }, [titulo]);

  return (
    <div className="avisos-globais">
      {erroPersistencia && (
        <div className="aviso-global">
          <p role="alert">{erroPersistencia}</p>

          <button type="button" onClick={fecharErro}>
            Fechar aviso
          </button>
        </div>
      )}

      {sessaoInvalida && (
        <section className="aviso-global" aria-label="Problema na sessão salva">
          <p role="alert">
            Os dados da sessão salva estão inválidos. Descarte essa sessão para
            continuar.
          </p>

          <button type="button" onClick={() => setConfirmarDescarte(true)}>
            Descartar sessão inválida
          </button>
        </section>
      )}

      <p className="aviso-leitor" role="status" aria-atomic="true">
        {aviso}
      </p>

      <ModalConfirmacao
        aberto={confirmarDescarte && sessaoInvalida}
        titulo="Descartar sessão inválida"
        mensagem="Deseja remover os dados da sessão inválida? Seus temporizadores e tarefas serão mantidos."
        textoConfirmar="Descartar sessão"
        aoConfirmar={() => {
          descartarSessaoSalva();
          setConfirmarDescarte(false);
        }}
        aoCancelar={() => setConfirmarDescarte(false)}
      />
    </div>
  );
}
