import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import InventoryGeneral from './pages/inventory/InventoryGeneral';
import InventoryTransfers from './pages/inventory/InventoryTransfers';
import InventoryWaste from './pages/inventory/InventoryWaste';
import InventoryCounts from './pages/inventory/InventoryCounts';
import InventorySamples from './pages/inventory/InventorySamples';
import InventorySpecial from './pages/inventory/InventorySpecial';
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
          <Route path="inventario" element={<InventoryGeneral />} />
          <Route path="inventario/traspasos" element={<InventoryTransfers />} />
          <Route path="inventario/mermas" element={<InventoryWaste />} />
          <Route path="inventario/conteos" element={<InventoryCounts />} />
          <Route path="inventario/muestras" element={<InventorySamples />} />
          <Route path="inventario/entradas-especiales" element={<InventorySpecial />} />
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
