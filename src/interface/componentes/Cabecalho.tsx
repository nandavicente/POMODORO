import { NavLink } from "react-router-dom";
import { formatarTempo, tempoRestanteMs } from "../../dominio/sessao";
import { ROTULO_FASE } from "../../dominio/tipos";
import { useApp } from "../estado";
import "./Cabecalho.css";

export default function Cabecalho() {
  const { sessao, agora } = useApp();

  return (
    <header className="cabecalho">
      <span className="cabecalho-marca">🍅 Pomodoro</span>

      <nav className="cabecalho-navegacao" aria-label="Navegação principal">
        <NavLink to="/" end>
          Início
        </NavLink>

        <NavLink to="/temporizadores">Temporizadores</NavLink>
      </nav>

      <p className="cabecalho-sessao">
        {sessao ? (
          <>
            {ROTULO_FASE[sessao.faseAtual]}
            {" . "}
            {formatarTempo(tempoRestanteMs(sessao, agora))}
            {sessao.status === "pausada" && " . Pausada"}
          </>
        ) : (
          "Nenhuma sessão ativa"
        )}
      </p>
    </header>
  );
}
