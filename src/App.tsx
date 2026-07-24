import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Inventory from './pages/Inventory';
import Inbound from './pages/Inbound';
import Outbound from './pages/Outbound';

import Arrivals from './pages/Arrivals';
import MaestrosClientes from './pages/MaestrosClientes';
import MaestrosMateriales from './pages/MaestrosMateriales';
import MaestrosProveedores from './pages/MaestrosProveedores';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/inventario" replace />} />
          <Route path="entrada" element={<Arrivals />} />
          <Route path="entrada/pre-aviso" element={<Inbound />} />
          <Route path="inventario/*" element={<Inventory />} />
          <Route path="salida" element={<Outbound />} />
          
          <Route path="maestros/clientes" element={<MaestrosClientes />} />
          <Route path="maestros/materiales" element={<MaestrosMateriales />} />
          <Route path="maestros/proveedores" element={<MaestrosProveedores />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
