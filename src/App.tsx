import { Route, Routes } from "react-router-dom";
import Inicio from "./interface/paginas/Inicio";
import Temporizadores from "./interface/paginas/Temporizadores";
import Cabecalho from "./interface/componentes/Cabecalho";
import AvisosGlobais from "./interface/componentes/AvisosGlobais";
import { useApp } from "./interface/estado";

export default function App() {
  const { sessaoInvalida } = useApp();
  return (
    <>
      <Cabecalho />
      <AvisosGlobais />

      {!sessaoInvalida && (
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/temporizadores" element={<Temporizadores />} />
        </Routes>
      )}
    </>
  );
}
