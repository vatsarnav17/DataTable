import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DTable from './Comp/DataTable';
import 'primereact/resources/themes/lara-light-indigo/theme.css'; 
import 'primereact/resources/primereact.min.css'; 
import 'primeicons/primeicons.css'; 


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DTable/>
  </StrictMode>
)
