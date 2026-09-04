import { Route, Routes } from 'react-router-dom'
import { CandyDefs } from './assets/CandyDefs'
import { ToastProvider } from './components/Toast'
import Home from './pages/Home'
import Mine from './pages/Mine'
import Open from './pages/Open'
import Throw from './pages/Throw'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <ToastProvider>
      <div className="sky" aria-hidden="true" />
      <CandyDefs />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/me" element={<Mine />} />
        <Route path="/me/open" element={<Open />} />
        <Route path="/b/:slug" element={<Throw />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ToastProvider>
  )
}
