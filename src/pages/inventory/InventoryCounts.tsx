import React, { useState, useMemo } from 'react';
import Header from '../../components/Header';
import { useInventoryData, AdjustmentHeader, AdjustmentDetail } from '../../hooks/useInventoryData';
import { InventoryFilters } from '../../components/inventory/InventoryFilters';
import { InventoryTable } from '../../components/inventory/InventoryTable';

const InventoryCounts: React.FC = () => {
  const { adjustments, loading, fetchAdjustments } = useInventoryData();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTipoMov, setSelectedTipoMov] = useState<string>('TODOS');
  const [selectedTipoStock, setSelectedTipoStock] = useState<string>('TODOS');
  const [selectedAjuste, setSelectedAjuste] = useState<{ header: AdjustmentHeader, detalle: AdjustmentDetail } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter(header => {
      const tieneConteo = header.detalles.some(d => ['711', '712', '717', '718'].includes(d.Tipo_Movimiento));
      if (!tieneConteo) return false;

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
          (header.Documento_SAP_Ref && header.Documento_SAP_Ref.toLowerCase().includes(term));
        const matchDetail = header.detalles.some(d =>
          (d.Codigo_Material && d.Codigo_Material.toLowerCase().includes(term)) ||
          (d.Lote_SAP && d.Lote_SAP.toLowerCase().includes(term))
        );
        return matchHeader || matchDetail;
      }
      return true;
    });
  }, [adjustments, selectedTipoStock, selectedTipoMov, searchTerm]);

  const salidasStock = adjustments.reduce((acc, header) =>
    acc + header.detalles.filter(d => ['711', '717'].includes(d.Tipo_Movimiento) || d.Cantidad < 0).reduce((sum, d) => sum + Math.abs(d.Cantidad), 0)
  , 0);
  const entradasStock = adjustments.reduce((acc, header) =>
    acc + header.detalles.filter(d => ['712', '718'].includes(d.Tipo_Movimiento) || d.Cantidad > 0).reduce((sum, d) => sum + d.Cantidad, 0)
  , 0);

  return (
    <>
      <Header showSearch={false} />
      <main className="page-content">
        <h2 className="page-title">Conteos Cíclicos y Diferencias de Inventario</h2>
        <p className="page-subtitle">Monitoreo de sobrantes (+) y faltantes (-) derivados de tomas de inventario físico periódico. (SAP 711, 712)</p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div className="metric-card" style={{ padding: '16px 20px', minHeight: 'unset', flex: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div className="metric-title" style={{ fontSize: '0.7rem' }}>FALTANTES REGISTRADOS (-711)</div>
            <div className="metric-value" style={{ fontSize: '1.75rem', marginTop: '4px', color: 'var(--danger-main)' }}>{salidasStock} Un.</div>
          </div>
          <div className="metric-card" style={{ padding: '16px 20px', minHeight: 'unset', flex: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div className="metric-title" style={{ fontSize: '0.7rem' }}>SOBRANTES / HALLAZGOS (+712)</div>
            <div className="metric-value" style={{ fontSize: '1.75rem', marginTop: '4px', color: 'var(--success-main)' }}>+{entradasStock} Un.</div>
          </div>
          <div className="metric-card" style={{ padding: '16px 20px', minHeight: 'unset', flex: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div className="metric-title" style={{ fontSize: '0.7rem' }}>CLASE BAPI SAP</div>
            <div className="metric-value" style={{ fontSize: '1.75rem', marginTop: '4px' }}>GM_CODE 05</div>
          </div>
        </div>

        <InventoryFilters 
          activeTab="conteos"
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

export default InventoryCounts;
