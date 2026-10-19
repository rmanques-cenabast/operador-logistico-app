import React, { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { ArrivalOrder, ArrivalDetailModal } from '../components/arrivals/ArrivalDetailModal';
import { ArrivalsFilters } from '../components/arrivals/ArrivalsFilters';
import { ArrivalsTable } from '../components/arrivals/ArrivalsTable';
import { ArrivalsService, PaginatedReceivedOrders } from '../services/arrivals.service';
import { usePolling } from '../hooks/usePolling';
import { useDebounce } from '../hooks/useDebounce';

const Arrivals: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [filterProvider, setFilterProvider] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 350);
  
  const { lineaNegocio, lineaNegocioLabel } = useAuth();
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [documentsMap, setDocumentsMap] = useState<Record<string, any[]>>({});
  const [dbProviders, setDbProviders] = useState<string[]>([]);

  // Cargar lista de proveedores desde la base de datos
  useEffect(() => {
    ArrivalsService.getProviders(lineaNegocio).then(list => {
      setDbProviders(list);
    });
  }, [lineaNegocio]);

  // Resetear a página 1 cuando cambian filtros o búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterProvider, filterStatus]);

  // Usar usePolling con paginación y búsqueda en servidor
  const { data: responseData, isLoading } = usePolling<PaginatedReceivedOrders>({
    fetcher: () => ArrivalsService.getReceivedOrders({
      lineaNegocio,
      page: currentPage,
      limit: 25,
      search: debouncedSearchTerm,
      provider: filterProvider,
      status: filterStatus
    }),
    initialData: null,
    intervalMs: 20000,
    dependencies: [lineaNegocio, currentPage, debouncedSearchTerm, filterProvider, filterStatus]
  });

  const orders: ArrivalOrder[] = responseData?.orders || [];
  const pagination = responseData?.pagination || { page: 1, limit: 25, totalItems: 0, totalPages: 1 };

  const uniqueProviders = useMemo(() => {
    if (dbProviders.length > 0) return dbProviders;
    return Array.from(new Set(orders.map(o => o.provider)));
  }, [dbProviders, orders]);

  // Cargar documentos al abrir modal sin depender de orders para no disparar llamadas en cada polling
  useEffect(() => {
    if (isPanelOpen && selectedRowId) {
      const target = orders.find(o => o.id === selectedRowId || o.rowId === selectedRowId);
      if (target) {
        const relevantOrders = target.idRecepcion 
          ? orders.filter(o => o.idRecepcion === target.idRecepcion)
          : [target];
        
        const distinctKeys = new Set<string>();
        relevantOrders.forEach(o => {
          if (o.poNumber && o.id) {
            distinctKeys.add(`${o.poNumber}|${o.id}`);
          }
        });

        distinctKeys.forEach(combined => {
          const [po, preAviso] = combined.split('|');
          ArrivalsService.getDocuments(po, preAviso).then(docs => {
            const key = `${po}-${preAviso}`;
            setDocumentsMap(prev => ({ ...prev, [key]: docs }));
          });
        });
      }
    }
  }, [isPanelOpen, selectedRowId]);



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
      // Refrescar las órdenes para reflejar el nuevo estado
      await ArrivalsService.getReceivedOrders({
        lineaNegocio,
        page: currentPage,
        limit: 25,
        search: debouncedSearchTerm,
        provider: filterProvider,
        status: filterStatus
      });
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
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                RECEPCIÓN DE MERCANCÍA
              </h2>
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
            orders={orders}
            isLoading={isLoading && orders.length === 0}
            onOpenDetail={handleOpenDetail}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
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
