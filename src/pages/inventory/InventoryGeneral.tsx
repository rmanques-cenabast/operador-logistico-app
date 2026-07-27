import React, { useState, useMemo } from 'react';
import Header from '../../components/Header';
import { useInventoryData, AdjustmentHeader, AdjustmentDetail } from '../../hooks/useInventoryData';
import { InventoryFilters } from '../../components/inventory/InventoryFilters';
import { InventoryTable } from '../../components/inventory/InventoryTable';

const InventoryGeneral: React.FC = () => {
  const { adjustments, loading, fetchAdjustments } = useInventoryData();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTipoMov, setSelectedTipoMov] = useState<string>('TODOS');
  const [selectedTipoStock, setSelectedTipoStock] = useState<string>('TODOS');
  const [selectedAjuste, setSelectedAjuste] = useState<{ header: AdjustmentHeader, detalle: AdjustmentDetail } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter(header => {
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
  }, [adjustments, selectedTipoStock, selectedTipoMov, searchTerm]);

  const totalDetalles = adjustments.reduce((acc, header) => acc + header.detalles.length, 0);
  const salidasStock = adjustments.reduce((acc, header) =>
    acc + header.detalles.filter(d => d.Cantidad < 0).reduce((sum, d) => sum + Math.abs(d.Cantidad), 0)
  , 0);
  const entradasStock = adjustments.reduce((acc, header) =>
    acc + header.detalles.filter(d => d.Cantidad > 0).reduce((sum, d) => sum + d.Cantidad, 0)
  , 0);
  const impactoNeto = entradasStock - salidasStock;

  const traspasosConFecha = adjustments.flatMap(h =>
    h.detalles.filter(d => ['311', '321', '344', '343', '309'].includes(d.Tipo_Movimiento) || (d.Almacen_Origen && d.Almacen_Destino))
  );
  const totalTraspasos = traspasosConFecha.length;

  return (
    <>
      <Header showSearch={false} />
      <main className="page-content">
        <h2 className="page-title">Registros y Movimientos Generales WMS / SAP</h2>
        <p className="page-subtitle">Consolidador general de movimientos de inventario con auditoría BAPI_GOODSMVT_CREATE.</p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div className="metric-card" style={{ padding: '16px 20px', minHeight: 'unset', flex: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div className="metric-title" style={{ fontSize: '0.7rem' }}>TOTAL MOVIMIENTOS</div>
            <div className="metric-value" style={{ fontSize: '1.75rem', marginTop: '4px' }}>{totalDetalles}</div>
          </div>
          <div className="metric-card" style={{ padding: '16px 20px', minHeight: 'unset', flex: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div className="metric-title" style={{ fontSize: '0.7rem' }}>TRASPASOS REALIZADOS (311)</div>
            <div className="metric-value" style={{ fontSize: '1.75rem', marginTop: '4px', color: 'var(--primary-main)' }}>{totalTraspasos}</div>
          </div>
          <div className="metric-card" style={{ padding: '16px 20px', minHeight: 'unset', flex: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div className="metric-title" style={{ fontSize: '0.7rem' }}>IMPACTO NETO DE STOCK</div>
            <div className="metric-value" style={{ fontSize: '1.75rem', marginTop: '4px', color: impactoNeto > 0 ? 'var(--info-main)' : (impactoNeto < 0 ? 'var(--danger-main)' : 'inherit') }}>
              {impactoNeto > 0 ? '+' : ''}{impactoNeto.toLocaleString()} Un.
            </div>
          </div>
        </div>

        <InventoryFilters 
          activeTab="generales"
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          selectedTipoMov={selectedTipoMov} setSelectedTipoMov={setSelectedTipoMov}
          selectedTipoStock={selectedTipoStock} setSelectedTipoStock={setSelectedTipoStock}
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
    </>
  );
};

export default InventoryGeneral;
