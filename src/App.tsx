import { AuthProvider } from '@/contexts/AuthContext'
import AppRouter from './router'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App
