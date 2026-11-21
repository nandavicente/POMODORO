import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // conecta a navegação ao enderec do naveg
import { AppProvider } from './interface/estado.tsx' //qunando acessar Temporizadores não vai reiniciar o estado da sessão
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <BrowserRouter>  
        <App />
      </BrowserRouter>
    </AppProvider>
  </StrictMode>,
)
