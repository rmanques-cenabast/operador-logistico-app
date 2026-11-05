import React, { useState, useMemo, useEffect } from 'react';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import { useInventoryData, AdjustmentHeader, AdjustmentDetail } from '../../hooks/useInventoryData';
import { InventoryFilters } from '../../components/inventory/InventoryFilters';
import { InventoryTable } from '../../components/inventory/InventoryTable';

const InventoryGeneral: React.FC = () => {
  const { lineaNegocio } = useAuth();
  const [selectedAlmacen, setSelectedAlmacen] = useState<string>('TODOS');
  const { adjustments, loading, fetchAdjustments } = useInventoryData(undefined, 50, lineaNegocio);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTipoMov, setSelectedTipoMov] = useState<string>('TODOS');
  const [selectedTipoStock, setSelectedTipoStock] = useState<string>('TODOS');
  const [selectedAjuste, setSelectedAjuste] = useState<{ header: AdjustmentHeader, detalle: AdjustmentDetail } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reiniciar filtro de almacén si se cambia la línea de negocio en el Header
  useEffect(() => {
    setSelectedAlmacen('TODOS');
  }, [lineaNegocio]);

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter(header => {
      // 1. Filtrar estrictamente por los almacenes de la línea activa
      // Intermediación: 6001 al 6015 | Farmacias Privadas: 6101 al 6115
      const matchLinea = header.detalles.some(d => {
        const origen = d.Almacen_Origen ? parseInt(d.Almacen_Origen, 10) : 0;
        const destino = d.Almacen_Destino ? parseInt(d.Almacen_Destino, 10) : 0;
        if (lineaNegocio === 'INT') {
          return (origen >= 6001 && origen <= 6015) || (destino >= 6001 && destino <= 6015);
        } else {
          return (origen >= 6101 && origen <= 6115) || (destino >= 6101 && destino <= 6115);
        }
      });
      if (!matchLinea) return false;

      // 2. Filtrar por almacén específico seleccionado
      if (selectedAlmacen !== 'TODOS') {
        const matchAlmacen = header.detalles.some(d => 
          d.Almacen_Origen === selectedAlmacen || d.Almacen_Destino === selectedAlmacen
        );
        if (!matchAlmacen) return false;
      }

      if (selectedTipoStock !== 'TODOS') {
        const matchStock = header.detalles.some(d => {
          const dAny = d as any;
          const tipoStock = String(dAny.TipoStockDestino || dAny.tipo_stock_destino || dAny.tipostockdestino || '').toUpperCase();
          let stockLabel = 'L.UTILIZACION';
          if (tipoStock === 'BLOQUEADO') stockLabel = 'BLOQUEADO';
          else if (tipoStock === 'CALIDAD') stockLabel = 'C.CALIDAD';
          return stockLabel === selectedTipoStock;
        });
        if (!matchStock) return false;
      }

      if (selectedTipoMov !== 'TODOS') {
        const matchMov = header.detalles.some(d => d.Tipo_Movimiento === selectedTipoMov);
        if (!matchMov) return false;
      }

      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchHeader =
          (header.Nro_Ajuste && header.Nro_Ajuste.toLowerCase().includes(term)) ||
          (header.Usuario_OL && header.Usuario_OL.toLowerCase().includes(term)) ||
          (header.Centro && header.Centro.toLowerCase().includes(term)) ||
          (header.Linea_Negocio && header.Linea_Negocio.toLowerCase().includes(term)) ||
          (header.Documento_SAP_Ref && header.Documento_SAP_Ref.toLowerCase().includes(term)) ||
          (header.Estado_SAP && header.Estado_SAP.toLowerCase().includes(term));

        const matchDetail = header.detalles.some(d =>
          (d.Codigo_Material && d.Codigo_Material.toLowerCase().includes(term)) ||
          (d.Lote_SAP && d.Lote_SAP.toLowerCase().includes(term)) ||
          (d.Numero_OC && d.Numero_OC.toLowerCase().includes(term)) ||
          (d.Motivo && d.Motivo.toLowerCase().includes(term)) ||
          (d.Almacen_Origen && d.Almacen_Origen.toLowerCase().includes(term)) ||
          (d.Almacen_Destino && d.Almacen_Destino.toLowerCase().includes(term))
        );
        return matchHeader || matchDetail;
      }
      return true;
    });
  }, [adjustments, selectedTipoStock, selectedTipoMov, searchTerm, lineaNegocio, selectedAlmacen]);

  return (
    <>
      <Header showSearch={false} />
      <div className="flex flex-col min-h-[calc(100vh-64px)] bg-slate-50 w-full">
        <main className="px-8 py-6 w-full flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
                  AJUSTE DE INVENTARIOS
                </h2>
                {lineaNegocio === 'INT' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Intermediación (Almacenes 6001 - 6015)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                    Farmacias Privadas (Almacenes 6101 - 6115)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Visualización y control segregado por línea de negocio de movimientos SAP
              </p>
            </div>
          </div>

        <InventoryFilters 
          activeTab="generales"
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          selectedTipoMov={selectedTipoMov} setSelectedTipoMov={setSelectedTipoMov}
          selectedTipoStock={selectedTipoStock} setSelectedTipoStock={setSelectedTipoStock}
          lineaNegocio={lineaNegocio}
          selectedAlmacen={selectedAlmacen} setSelectedAlmacen={setSelectedAlmacen}
          inputFechaDesde="" setInputFechaDesde={() => {}}
          inputFechaHasta="" setInputFechaHasta={() => {}}
          mermasFechaDesde="" setMermasFechaDesde={() => {}}
          mermasFechaHasta="" setMermasFechaHasta={() => {}}
          fetchAdjustments={fetchAdjustments}
        />

        <InventoryTable 
          loading={loading}
          filteredAdjustments={filteredAdjustments}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          selectedAjuste={selectedAjuste}
          setSelectedAjuste={setSelectedAjuste}
        />
      </main>
    </div>
  </>
  );
};

export default InventoryGeneral;
