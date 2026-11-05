import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../components/Header';
import { VISOR_API_URL, getApiHeaders } from '../../config/api';
import { 
  Warehouse, 
  Search, 
  RefreshCw, 
  Download, 
  Layers, 
  PackageCheck, 
  AlertTriangle, 
  ShieldAlert, 
  SlidersHorizontal,
  Filter,
  X
} from 'lucide-react';

interface StockItem {
  codigoMaterial: string;
  centro: string;
  almacen: string;
  lote: string;
  umb: string;
  moneda: string;
  libre: number;
  valorLibre: number;
  traslado: number;
  calidad: number;
  valorCalidad: number;
  noLibre: number;
  bloqueado: number;
  valorBloqueado: number;
  devoluciones: number;
  total: number;
}

const ALMACENES_FARMACIAS = [
  { codigo: '6101', nombre: '6101 - Disponible para Venta' },
  { codigo: '6102', nombre: '6102 - Destrucción / Mermas' },
  { codigo: '6103', nombre: '6103 - Deteriorado Imputable' },
  { codigo: '6104', nombre: '6104 - Corta Expiración' },
  { codigo: '6105', nombre: '6105 - Faltante Picking' },
  { codigo: '6106', nombre: '6106 - Control de Calidad' },
  { codigo: '6107', nombre: '6107 - Deteriorado / Faltante' },
  { codigo: '6108', nombre: '6108 - Devolución Cliente' },
  { codigo: '6109', nombre: '6109 - Devolución Cliente Rebote' },
  { codigo: '6110', nombre: '6110 - Retiro de Mercado' },
  { codigo: '6111', nombre: '6111 - Acondicionamiento Entrada' },
  { codigo: '6112', nombre: '6112 - Acondicionamiento Salida' },
  { codigo: '6113', nombre: '6113 - Inspección Rótulo' },
  { codigo: '6114', nombre: '6114 - Contramuestra' },
  { codigo: '6115', nombre: '6115 - Recepción / Andén' }
];

const TIPOS_STOCK = [
  { id: 'ALL', label: 'Todos los tipos de stock' },
  { id: 'LIBRE', label: 'Libre utilización' },
  { id: 'CALIDAD', label: 'En control calidad' },
  { id: 'BLOQUEADO', label: 'Bloqueado' },
  { id: 'TRASLADO', label: 'Tránsito / Traslado' },
  { id: 'NO_LIBRE', label: 'Stock no libre' },
  { id: 'DEVOLUCIONES', label: 'Devoluciones' }
];

const InventoryStockWarehouse: React.FC = () => {
  const [selectedAlmacen, setSelectedAlmacen] = useState<string>('6101');
  const [selectedStockType, setSelectedStockType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStock = async (almacen: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${VISOR_API_URL}/inventory/stock-almacen?almacen=${almacen}&limit=3000`, {
        headers: getApiHeaders()
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setItems(data.data?.items || []);
        setLastUpdated(new Date());
      } else {
        setError(data.message || 'No se pudo obtener el stock del almacén seleccionado.');
      }
    } catch (err: any) {
      setError(err.message || 'Error de comunicación con el servicio de stock.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock(selectedAlmacen);
  }, [selectedAlmacen]);

  const filteredItems = useMemo(() => {
    let result = items;

    // Filtro por tipo de stock
    if (selectedStockType === 'LIBRE') {
      result = result.filter(item => item.libre > 0);
    } else if (selectedStockType === 'CALIDAD') {
      result = result.filter(item => item.calidad > 0);
    } else if (selectedStockType === 'BLOQUEADO') {
      result = result.filter(item => item.bloqueado > 0);
    } else if (selectedStockType === 'TRASLADO') {
      result = result.filter(item => item.traslado > 0);
    } else if (selectedStockType === 'NO_LIBRE') {
      result = result.filter(item => item.noLibre > 0);
    } else if (selectedStockType === 'DEVOLUCIONES') {
      result = result.filter(item => item.devoluciones > 0);
    }

    // Filtro por término de búsqueda (Material SKU o Lote)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        item =>
          item.codigoMaterial.toLowerCase().includes(term) ||
          item.lote.toLowerCase().includes(term)
      );
    }

    return result;
  }, [items, selectedStockType, searchTerm]);

  // Métricas globales del almacén cargado (para las cards superiores)
  const metrics = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.totalLotes += 1;
        acc.totalLibre += item.libre;
        acc.totalValorLibre += item.valorLibre;
        acc.totalTraslado += item.traslado;
        acc.totalCalidad += item.calidad;
        acc.totalValorCalidad += item.valorCalidad;
        acc.totalNoLibre += item.noLibre;
        acc.totalBloqueado += item.bloqueado;
        acc.totalValorBloqueado += (item.valorBloqueado || 0);
        acc.totalDevoluciones += item.devoluciones;
        acc.totalGeneral += item.total;
        return acc;
      },
      {
        totalLotes: 0,
        totalLibre: 0,
        totalValorLibre: 0,
        totalTraslado: 0,
        totalCalidad: 0,
        totalValorCalidad: 0,
        totalNoLibre: 0,
        totalBloqueado: 0,
        totalValorBloqueado: 0,
        totalDevoluciones: 0,
        totalGeneral: 0
      }
    );
  }, [items]);

  // Totales de la tabla (calculados sobre los registros filtrados en pantalla)
  const tableTotals = useMemo(() => {
    return filteredItems.reduce(
      (acc, item) => {
        acc.totalValorLibre += item.valorLibre;
        acc.totalValorCalidad += item.valorCalidad;
        acc.totalValorBloqueado += (item.valorBloqueado || 0);
        return acc;
      },
      {
        totalValorLibre: 0,
        totalValorCalidad: 0,
        totalValorBloqueado: 0
      }
    );
  }, [filteredItems]);

  const exportToCSV = () => {
    if (filteredItems.length === 0) return;
    const headers = [
      'Material',
      'Ce.',
      'Alm.',
      'Lote',
      'UMB',
      'Libre utilizacion',
      'Mon.',
      'Valor libre util.',
      'Trans./Trasl.',
      'En control calidad',
      'Valor en insp.cal.',
      'Stock no libre',
      'Bloqueado',
      'Valor stock bloq.',
      'Devoluciones',
      'Total Fisico'
    ];
    const rows = filteredItems.map(i => [
      i.codigoMaterial,
      i.centro || '6000',
      i.almacen,
      i.lote,
      i.umb || 'UN',
      i.libre,
      i.moneda || 'CLP',
      i.valorLibre,
      i.traslado,
      i.calidad,
      i.valorCalidad,
      i.noLibre,
      i.bloqueado,
      i.valorBloqueado || 0,
      i.devoluciones,
      i.total
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Stock_MB52_Almacen_${selectedAlmacen}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const nombreAlmacenActual = useMemo(() => {
    const match = ALMACENES_FARMACIAS.find(a => a.codigo === selectedAlmacen);
    return match ? match.nombre : `Almacén ${selectedAlmacen}`;
  }, [selectedAlmacen]);

  return (
    <>
      <Header showSearch={false} />
      <main className="page-content" style={{ padding: '24px 32px' }}>
        {/* Título y Acciones Superiores */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Warehouse className="text-blue-600" size={28} />
              <h2 className="page-title" style={{ margin: 0 }}>Stock por Almacén en Vivo (MB52)</h2>
            </div>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted, #64748b)', fontSize: '14px' }}>
              Consulta en tiempo real de saldos por lote desde SAP ERP (Centro 6000)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => fetchStock(selectedAlmacen)}
              disabled={loading}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                fontWeight: 500,
                color: '#334155'
              }}
              title="Refrescar datos desde SAP"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refrescar
            </button>

            <button
              onClick={exportToCSV}
              disabled={filteredItems.length === 0}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: filteredItems.length === 0 ? 'not-allowed' : 'pointer',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontWeight: 500
              }}
            >
              <Download size={16} />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Tarjetas de Métricas Rápidas (KPIs) - Clickeables para filtrar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div 
            onClick={() => setSelectedStockType('ALL')}
            style={{ 
              background: selectedStockType === 'ALL' ? '#eff6ff' : '#ffffff', 
              border: selectedStockType === 'ALL' ? '2px solid #2563eb' : '1px solid #e2e8f0', 
              borderRadius: '12px', 
              padding: '16px 20px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Clic para ver todos los lotes"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
              <span>TOTAL LOTES</span>
              <Layers size={18} className="text-blue-500" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '8px' }}>
              {loading ? '...' : metrics.totalLotes.toLocaleString('es-CL')}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Registros con saldo positivo</div>
          </div>

          <div 
            onClick={() => setSelectedStockType(prev => prev === 'LIBRE' ? 'ALL' : 'LIBRE')}
            style={{ 
              background: selectedStockType === 'LIBRE' ? '#f0fdf4' : '#ffffff', 
              border: selectedStockType === 'LIBRE' ? '2px solid #16a34a' : '1px solid #e2e8f0', 
              borderRadius: '12px', 
              padding: '16px 20px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Clic para filtrar por Libre Utilización"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#16a34a', fontSize: '13px', fontWeight: 600 }}>
              <span>LIBRE UTILIZACIÓN</span>
              <PackageCheck size={18} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a', marginTop: '8px' }}>
              {loading ? '...' : metrics.totalLibre.toLocaleString('es-CL')} <span style={{ fontSize: '14px', fontWeight: 500 }}>UN</span>
            </div>
          </div>

          <div 
            onClick={() => setSelectedStockType(prev => prev === 'CALIDAD' ? 'ALL' : 'CALIDAD')}
            style={{ 
              background: selectedStockType === 'CALIDAD' ? '#fffbeb' : '#ffffff', 
              border: selectedStockType === 'CALIDAD' ? '2px solid #d97706' : '1px solid #e2e8f0', 
              borderRadius: '12px', 
              padding: '16px 20px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Clic para filtrar por Control de Calidad"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#d97706', fontSize: '13px', fontWeight: 600 }}>
              <span>CONTROL CALIDAD</span>
              <AlertTriangle size={18} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#d97706', marginTop: '8px' }}>
              {loading ? '...' : metrics.totalCalidad.toLocaleString('es-CL')} <span style={{ fontSize: '14px', fontWeight: 500 }}>UN</span>
            </div>
          </div>

          <div 
            onClick={() => setSelectedStockType(prev => prev === 'BLOQUEADO' ? 'ALL' : 'BLOQUEADO')}
            style={{ 
              background: selectedStockType === 'BLOQUEADO' ? '#fef2f2' : '#ffffff', 
              border: selectedStockType === 'BLOQUEADO' ? '2px solid #dc2626' : '1px solid #e2e8f0', 
              borderRadius: '12px', 
              padding: '16px 20px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Clic para filtrar por Stock Bloqueado"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>
              <span>BLOQUEADO</span>
              <ShieldAlert size={18} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626', marginTop: '8px' }}>
              {loading ? '...' : metrics.totalBloqueado.toLocaleString('es-CL')} <span style={{ fontSize: '14px', fontWeight: 500 }}>UN</span>
            </div>
          </div>
        </div>

        {/* Barra de Filtros: Selector de Almacén + Selector Tipo Stock + Buscador SKU/Lote */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 260px' }}>
            <label htmlFor="select-almacen" style={{ fontSize: '14px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              <SlidersHorizontal size={16} /> Almacén:
            </label>
            <select
              id="select-almacen"
              value={selectedAlmacen}
              onChange={(e) => setSelectedAlmacen(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                fontWeight: 600,
                color: '#0f172a',
                background: '#f8fafc',
                cursor: 'pointer'
              }}
            >
              {ALMACENES_FARMACIAS.map(alm => (
                <option key={alm.codigo} value={alm.codigo}>
                  {alm.nombre}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 240px' }}>
            <label htmlFor="select-stock-type" style={{ fontSize: '14px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              <Filter size={16} /> Tipo de Stock:
            </label>
            <select
              id="select-stock-type"
              value={selectedStockType}
              onChange={(e) => setSelectedStockType(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: selectedStockType !== 'ALL' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                fontSize: '14px',
                fontWeight: 600,
                color: selectedStockType !== 'ALL' ? '#1d4ed8' : '#0f172a',
                background: selectedStockType !== 'ALL' ? '#eff6ff' : '#f8fafc',
                cursor: 'pointer'
              }}
            >
              {TIPOS_STOCK.map(tipo => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', flex: '1 1 240px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Buscar por Material o Lote..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                background: '#ffffff'
              }}
            />
          </div>

          {(selectedStockType !== 'ALL' || searchTerm.trim()) && (
            <button
              onClick={() => {
                setSelectedStockType('ALL');
                setSearchTerm('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f1f5f9',
                color: '#475569',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Quitar filtros y mostrar todo"
            >
              <X size={14} /> Limpiar
            </button>
          )}

          <div style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
            Última sync: {lastUpdated.toLocaleTimeString('es-CL')}
          </div>
        </div>

        {/* Mensaje de Error si aplica */}
        {error && (
          <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Tabla de Resultados estilo MB52 */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                Mostrando {filteredItems.length} {filteredItems.length === 1 ? 'lote' : 'lotes'} en {nombreAlmacenActual}
              </span>
              {selectedStockType !== 'ALL' && (
                <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontSize: '12px', fontWeight: 600 }}>
                  Filtro: {TIPOS_STOCK.find(t => t.id === selectedStockType)?.label}
                </span>
              )}
            </div>
            {searchTerm && (
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Búsqueda: "{searchTerm}"
              </span>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', whiteSpace: 'nowrap' }}>
              <thead>
                <tr style={{ background: '#dbeafe', borderBottom: '2px solid #93c5fd', color: '#1e3a8a', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '10px 12px', borderRight: '1px solid #bfdbfe' }}>Material</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', borderRight: '1px solid #bfdbfe' }}>Ce.</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', borderRight: '1px solid #bfdbfe' }}>Alm.</th>
                  <th style={{ padding: '10px 12px', borderRight: '1px solid #bfdbfe' }}>Lote</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', borderRight: '1px solid #bfdbfe' }}>UMB</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', borderRight: '1px solid #bfdbfe' }}>Libre utilización</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', borderRight: '1px solid #bfdbfe' }}>Mon.</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', borderRight: '1px solid #bfdbfe' }}>Valor libre util.</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', borderRight: '1px solid #bfdbfe' }}>Trans./Trasl.</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', borderRight: '1px solid #bfdbfe' }}>En control calidad</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', borderRight: '1px solid #bfdbfe' }}>Valor en insp.cal.</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', borderRight: '1px solid #bfdbfe' }}>Stock no libre</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', borderRight: '1px solid #bfdbfe' }}>Bloqueado</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', borderRight: '1px solid #bfdbfe' }}>Valor stock bloq.</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', borderRight: '1px solid #bfdbfe' }}>Devoluciones</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Total Físico</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={16} style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                      <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '8px' }}></div>
                      <div>Consultando stock en tiempo real desde SAP ERP...</div>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={16} style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                      <Warehouse size={40} style={{ margin: '0 auto 12px auto', color: '#cbd5e1' }} />
                      <div style={{ fontWeight: 600, color: '#334155' }}>No se encontraron lotes con saldo positivo</div>
                      <div style={{ fontSize: '13px', marginTop: '4px' }}>El almacén seleccionado no registra stock disponible o no coincide con tu búsqueda.</div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => (
                    <tr 
                      key={`${item.codigoMaterial}-${item.lote}-${idx}`}
                      style={{ 
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background 0.15s ease',
                        background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                        fontFamily: 'Inter, system-ui, sans-serif'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#eef2ff')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#f8fafc')}
                    >
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1e293b', borderRight: '1px solid #f1f5f9' }}>
                        {item.codigoMaterial}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>
                        {item.centro || '6000'}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: '#0369a1', borderRight: '1px solid #f1f5f9' }}>
                        {item.almacen}
                      </td>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 600, color: '#0f172a', borderRight: '1px solid #f1f5f9' }}>
                        {item.lote}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>
                        {item.umb || 'UN'}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: item.libre > 0 ? 600 : 400, color: item.libre > 0 ? '#15803d' : '#94a3b8', borderRight: '1px solid #f1f5f9' }}>
                        {item.libre.toLocaleString('es-CL')}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b', fontSize: '11px', borderRight: '1px solid #f1f5f9' }}>
                        {item.moneda || 'CLP'}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: item.valorLibre > 0 ? 600 : 400, color: item.valorLibre > 0 ? '#0f172a' : '#94a3b8', borderRight: '1px solid #f1f5f9' }}>
                        {item.valorLibre.toLocaleString('es-CL')}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: item.traslado > 0 ? '#0284c7' : '#94a3b8', borderRight: '1px solid #f1f5f9' }}>
                        {item.traslado.toLocaleString('es-CL')}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: item.calidad > 0 ? 600 : 400, color: item.calidad > 0 ? '#b45309' : '#94a3b8', borderRight: '1px solid #f1f5f9' }}>
                        {item.calidad.toLocaleString('es-CL')}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: item.valorCalidad > 0 ? 600 : 400, color: item.valorCalidad > 0 ? '#0f172a' : '#94a3b8', borderRight: '1px solid #f1f5f9' }}>
                        {item.valorCalidad.toLocaleString('es-CL')}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: item.noLibre > 0 ? '#d97706' : '#94a3b8', borderRight: '1px solid #f1f5f9' }}>
                        {item.noLibre.toLocaleString('es-CL')}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: item.bloqueado > 0 ? 600 : 400, color: item.bloqueado > 0 ? '#b91c1c' : '#94a3b8', borderRight: '1px solid #f1f5f9' }}>
                        {item.bloqueado.toLocaleString('es-CL')}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: (item.valorBloqueado || 0) > 0 ? 600 : 400, color: (item.valorBloqueado || 0) > 0 ? '#0f172a' : '#94a3b8', borderRight: '1px solid #f1f5f9' }}>
                        {(item.valorBloqueado || 0).toLocaleString('es-CL')}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: item.devoluciones > 0 ? '#7c3aed' : '#94a3b8', borderRight: '1px solid #f1f5f9' }}>
                        {item.devoluciones.toLocaleString('es-CL')}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        {item.total.toLocaleString('es-CL')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {filteredItems.length > 0 && !loading && (
                <tfoot>
                  <tr style={{ background: '#fef08a', borderTop: '2px solid #ca8a04', borderBottom: '2px solid #ca8a04', fontWeight: 700, color: '#713f12', fontSize: '13px' }}>
                    <td style={{ padding: '10px 12px', borderRight: '1px solid #fde047' }}>*</td>
                    <td style={{ padding: '10px 12px', borderRight: '1px solid #fde047' }}></td>
                    <td style={{ padding: '10px 12px', borderRight: '1px solid #fde047' }}></td>
                    <td style={{ padding: '10px 12px', borderRight: '1px solid #fde047' }}></td>
                    <td style={{ padding: '10px 12px', borderRight: '1px solid #fde047' }}></td>
                    <td style={{ padding: '10px 12px', borderRight: '1px solid #fde047' }}></td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', borderRight: '1px solid #fde047' }}>CLP</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', borderRight: '1px solid #fde047' }}>
                      {tableTotals.totalValorLibre.toLocaleString('es-CL')}
                    </td>
                    <td style={{ padding: '10px 12px', borderRight: '1px solid #fde047' }}></td>
                    <td style={{ padding: '10px 12px', borderRight: '1px solid #fde047' }}></td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', borderRight: '1px solid #fde047' }}>
                      {tableTotals.totalValorCalidad.toLocaleString('es-CL')}
                    </td>
                    <td style={{ padding: '10px 12px', borderRight: '1px solid #fde047' }}></td>
                    <td style={{ padding: '10px 12px', borderRight: '1px solid #fde047' }}></td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', borderRight: '1px solid #fde047' }}>
                      {tableTotals.totalValorBloqueado.toLocaleString('es-CL')}
                    </td>
                    <td style={{ padding: '10px 12px', borderRight: '1px solid #fde047' }}></td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </main>
    </>
  );
};

export default InventoryStockWarehouse;
