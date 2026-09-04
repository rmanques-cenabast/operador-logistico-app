import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Páginas cargadas de forma síncrona inmediata
import Login from './pages/Login';

// Lazy Loading / Code Splitting (Se descargan solo cuando el usuario navega a esa pantalla)
const InventoryGeneral = lazy(() => import('./pages/inventory/InventoryGeneral'));
const InventoryTransfers = lazy(() => import('./pages/inventory/InventoryTransfers'));
const InventoryWaste = lazy(() => import('./pages/inventory/InventoryWaste'));
const InventoryCounts = lazy(() => import('./pages/inventory/InventoryCounts'));
const InventorySamples = lazy(() => import('./pages/inventory/InventorySamples'));
const InventorySpecial = lazy(() => import('./pages/inventory/InventorySpecial'));
const Inbound = lazy(() => import('./pages/Inbound'));
const Outbound = lazy(() => import('./pages/Outbound'));
const UploadPreaviso = lazy(() => import('./pages/UploadPreaviso'));
const Reports = lazy(() => import('./pages/Reports'));
const Arrivals = lazy(() => import('./pages/Arrivals'));
const MaestrosClientes = lazy(() => import('./pages/MaestrosClientes'));
const MaestrosMateriales = lazy(() => import('./pages/MaestrosMateriales'));
const MaestrosProveedores = lazy(() => import('./pages/MaestrosProveedores'));

// Fallback de carga ligero y elegante
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/inventario" replace />} />
                <Route path="entrada" element={<Arrivals />} />
                <Route path="entrada/pre-aviso" element={<Inbound />} />
                <Route path="entrada/pre-aviso/upload" element={<UploadPreaviso />} />
                <Route path="inventario" element={<InventoryGeneral />} />
                <Route path="inventario/traspasos" element={<InventoryTransfers />} />
                <Route path="inventario/mermas" element={<InventoryWaste />} />
                <Route path="inventario/conteos" element={<InventoryCounts />} />
                <Route path="inventario/muestras" element={<InventorySamples />} />
                <Route path="inventario/especial" element={<InventorySpecial />} />
                <Route path="inventario/entradas-especiales" element={<InventorySpecial />} />
                <Route path="salida" element={<Outbound />} />
                <Route path="reportes" element={<Reports />} />
                <Route path="maestros/clientes" element={<MaestrosClientes />} />
                <Route path="maestros/materiales" element={<MaestrosMateriales />} />
                <Route path="maestros/proveedores" element={<MaestrosProveedores />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
