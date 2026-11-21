import {Route, Routes} from 'react-router-dom'
import Inicio from './interface/paginas/Inicio'
import Temporizadores from './interface/paginas/Temporizadores'
import Cabecalho from './interface/componentes/Cabecalho'

export default function App() {
  return(
    <>
      <Cabecalho/>

      <Routes>
        <Route path = "/" element = {<Inicio />}/>
        <Route path = "/temporizadores" element = {<Temporizadores/>}/>
      </Routes>
    </>
  )
}