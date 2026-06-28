import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles.css'

// No StrictMode: it double-invokes effects, which can confuse drei
// <ScrollControls> / postprocessing setup on mount.
createRoot(document.getElementById('root')).render(<App />)
