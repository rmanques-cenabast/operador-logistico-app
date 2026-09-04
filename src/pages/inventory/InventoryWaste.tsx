import React, { useState, useMemo } from 'react';
import Header from '../../components/Header';
import { useInventoryData, AdjustmentHeader, AdjustmentDetail } from '../../hooks/useInventoryData';
import { InventoryFilters } from '../../components/inventory/InventoryFilters';
import { InventoryTable } from '../../components/inventory/InventoryTable';

const InventoryWaste: React.FC = () => {
  const { adjustments, loading, fetchAdjustments } = useInventoryData();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTipoMov, setSelectedTipoMov] = useState<string>('TODOS');
  const [selectedTipoStock, setSelectedTipoStock] = useState<string>('TODOS');
  const [selectedAjuste, setSelectedAjuste] = useState<{ header: AdjustmentHeader, detalle: AdjustmentDetail } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [mermasFechaDesde, setMermasFechaDesde] = useState<string>('');
  const [mermasFechaHasta, setMermasFechaHasta] = useState<string>('');
  const [inputFechaDesde, setInputFechaDesde] = useState<string>('');
  const [inputFechaHasta, setInputFechaHasta] = useState<string>('');

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter(header => {
      const tieneMerma = header.detalles.some(d => (d.Cantidad < 0 && !['711', '717'].includes(d.Tipo_Movimiento)) || d.Tipo_Movimiento === '555');
      if (!tieneMerma) return false;

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
          (d.Lote_SAP && d.Lote_SAP.toLowerCase().includes(term)) ||
          (d.Motivo && d.Motivo.toLowerCase().includes(term))
        );
        return matchHeader || matchDetail;
      }
      return true;
    });
  }, [adjustments, selectedTipoStock, selectedTipoMov, searchTerm]);

  let mermasConFecha = adjustments.flatMap(h =>
    h.detalles
      .filter(d => d.Cantidad < 0 || d.Tipo_Movimiento === '555')
      .map(d => ({ ...d, fechaObj: new Date(h.Fecha_Creacion) }))
  );

  if (mermasFechaDesde) {
    const desde = new Date(mermasFechaDesde);
    mermasConFecha = mermasConFecha.filter(m => new Date(m.fechaObj) >= desde);
  }
  if (mermasFechaHasta) {
    const hasta = new Date(mermasFechaHasta);
    hasta.setHours(23, 59, 59, 999);
    mermasConFecha = mermasConFecha.filter(m => new Date(m.fechaObj) <= hasta);
  }

  return (
    <>
      <Header showSearch={false} />
      <main className="page-content">
        <h2 className="page-title">Mermas, Desguaces y Destrucción</h2>
        <p className="page-subtitle">Registro y auditoría de salidas por medicamentos destruidos, dañados o vencidos con Centro de Costos. (SAP 555)</p>

        <InventoryFilters 
          activeTab="mermas"
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          selectedTipoMov={selectedTipoMov} setSelectedTipoMov={setSelectedTipoMov}
          selectedTipoStock={selectedTipoStock} setSelectedTipoStock={setSelectedTipoStock}
          inputFechaDesde={inputFechaDesde} setInputFechaDesde={setInputFechaDesde}
          inputFechaHasta={inputFechaHasta} setInputFechaHasta={setInputFechaHasta}
          mermasFechaDesde={mermasFechaDesde} setMermasFechaDesde={setMermasFechaDesde}
          mermasFechaHasta={mermasFechaHasta} setMermasFechaHasta={setMermasFechaHasta}
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

export default InventoryWaste;
