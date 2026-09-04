import React, { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { ArrivalOrder, ArrivalDetailModal } from '../components/arrivals/ArrivalDetailModal';
import { ArrivalsFilters } from '../components/arrivals/ArrivalsFilters';
import { ArrivalsTable } from '../components/arrivals/ArrivalsTable';
import { ArrivalsService } from '../services/arrivals.service';
import { usePolling } from '../hooks/usePolling';

const Arrivals: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [filterProvider, setFilterProvider] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { user } = useAuth();
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [documentsMap, setDocumentsMap] = useState<Record<string, any[]>>({});

  const lineaNegocio = user?.role === 'intermediacion' ? 'INT' : 'FP';
  const lineaNegocioLabel = user?.role === 'intermediacion' ? 'INTERMEDIACIÓN' : 'FARMACIAS PRIVADAS';

  // Usar usePolling con caché en memoria SWR
  const { data: rawOrders, isLoading } = usePolling<ArrivalOrder[]>({
    fetcher: () => ArrivalsService.getReceivedOrders(lineaNegocio),
    initialData: ArrivalsService.getCachedReceivedOrders(lineaNegocio),
    intervalMs: 20000,
    dependencies: [lineaNegocio]
  });

  const orders: ArrivalOrder[] = rawOrders || [];

  const uniqueProviders = useMemo(() => {
    return Array.from(new Set(orders.map(o => o.provider)));
  }, [orders]);

  const processedOrders = useMemo(() => {
    return orders.filter(line => {
      if (filterProvider !== 'TODOS' && line.provider !== filterProvider) return false;
      if (filterStatus !== 'TODOS') {
        if (filterStatus === 'CON DIFERENCIAS') {
          if (line.status !== 'FALTANTE' && line.status !== 'SOBRANTE') return false;
        } else if (line.status !== filterStatus) {
          return false;
        }
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          line.id.toLowerCase().includes(term) ||
          line.poNumber.toLowerCase().includes(term) ||
          line.provider.toLowerCase().includes(term) ||
          line.productCode.toLowerCase().includes(term) ||
          line.batch.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [orders, filterProvider, filterStatus, searchTerm]);

  // Cargar documentos al abrir modal
  useEffect(() => {
    if (isPanelOpen && selectedRowId) {
      const selectedLines = orders.filter(o => o.id === selectedRowId || o.rowId === selectedRowId);
      selectedLines.forEach(async (line) => {
        const docs = await ArrivalsService.getDocuments(line.poNumber, line.id);
        const key = `${line.poNumber}-${line.id}`;
        setDocumentsMap(prev => ({ ...prev, [key]: docs }));
      });
    }
  }, [isPanelOpen, selectedRowId, orders]);

  const totalRecepciones = useMemo(() => Array.from(new Set(orders.map(o => o.id))).length, [orders]);
  const totalDiscrepancias = useMemo(() => Array.from(new Set(
    orders.filter(l => l.status === 'FALTANTE' || l.status === 'SOBRANTE').map(o => o.id)
  )).length, [orders]);

  const handleOpenDetail = (rowId: string) => {
    setSelectedRowId(rowId);
    setIsPanelOpen(true);
  };

  const handleLiberar = async (numeroPreAviso?: string): Promise<{ success: boolean; message: string }> => {
    if (!numeroPreAviso) return { success: false, message: 'Número de preaviso no especificado' };
    try {
      const data = await ArrivalsService.liberarSAP(numeroPreAviso);
      if (data.status === 'error') {
        return { success: false, message: data.message || 'Error al procesar la liberación' };
      }
      // Refrescar las órdenes para reflejar el nuevo estado 'PENDIENTE'
      await ArrivalsService.getReceivedOrders(lineaNegocio);
      return { 
        success: true, 
        message: data.message || `Se ha autorizado la liberación a SAP para el preaviso ${numeroPreAviso}.` 
      };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Error de conexión al liberar' };
    }
  };


  return (
    <>
      <Header showSearch={false} />
      <div className="flex flex-col min-h-[calc(100vh-64px)] bg-slate-50 w-full">
        <main className="px-8 py-6 w-full flex-1">
          
          {/* Header de Página */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold tracking-wider uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {lineaNegocioLabel}
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                RECEPCIÓN EN BODEGA
              </h2>
            </div>
          </div>

          {/* Tarjetas de Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Recepciones Confirmadas
              </span>
              <span className="text-4xl font-mono font-bold text-slate-900">
                {isLoading && orders.length === 0 ? '...' : String(totalRecepciones).padStart(2, '0')}
              </span>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Con Discrepancias
              </span>
              <span className={`text-4xl font-mono font-bold ${totalDiscrepancias > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {isLoading && orders.length === 0 ? '...' : String(totalDiscrepancias).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Filtros */}
          <ArrivalsFilters 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterProvider={filterProvider}
            onProviderChange={setFilterProvider}
            filterStatus={filterStatus}
            onStatusChange={setFilterStatus}
            providers={uniqueProviders}
          />

          {/* Tabla */}
          <ArrivalsTable 
            orders={processedOrders}
            isLoading={isLoading && orders.length === 0}
            onOpenDetail={handleOpenDetail}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </main>

        {/* Modal de Detalle */}
        <ArrivalDetailModal 
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          selectedRowId={selectedRowId}
          orders={orders}
          documentsMap={documentsMap}
          onLiberar={handleLiberar}
          lineaNegocioLabel={lineaNegocioLabel}
        />
      </div>
    </>
  );
};

export default Arrivals;
