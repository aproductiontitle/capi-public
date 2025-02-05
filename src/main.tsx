import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById("root")!;
rootElement.classList.add('light'); // Add default theme class
createRoot(rootElement).render(<App />);