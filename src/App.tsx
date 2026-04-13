import { ThemeProvider } from '@/components/theme-provider'
import AppRouter from './router'
import './index.css'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="bike-exchange-theme">
      <AppRouter />
    </ThemeProvider>
  )
}

export default App
