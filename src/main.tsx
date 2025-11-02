import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// import { toast, Toaster } from 'sonner';
import toast, { Toaster } from 'react-hot-toast';


createRoot(document.getElementById('root')!).render(
  
  <StrictMode>
    {/* <Toaster richColors position="top-right" duration={3000} theme="light" closeButton /> */}
   <Toaster position='top-right' />
    <App />
  </StrictMode>,
)


