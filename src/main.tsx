import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Modal from 'react-modal'
import App from './App.tsx'
import { GlobalStyle } from './styles/global.ts'
import { startChunkLoadErrorWatchdog, startDailyReloadWatchdog } from './utils/watchdog.ts'

const rootElement = document.getElementById('root')!

// react-modal precisa saber qual elemento é o "app root" para poder
// esconder o resto da árvore de leitores de tela enquanto um modal está
// aberto. Isso só precisa ser configurado uma vez — chamar a cada render do
// componente Totem (como acontecia antes) não tem efeito adicional e só
// reexecuta trabalho desnecessário.
Modal.setAppElement(rootElement)

// Watchdogs de operação 24/7 sem supervisão (ver src/utils/watchdog.ts).
startDailyReloadWatchdog()
startChunkLoadErrorWatchdog()

createRoot(rootElement).render(
  <StrictMode>
    <GlobalStyle />
    <App />
  </StrictMode>,
)
