import React, { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import { ChevronDown, ChevronLeft, ChevronRight, X, Search, Calendar, AlertTriangle, Package } from 'lucide-react';

interface ArrivalOrder {
  rowId: string;
  id: string; // NumeroEntrega (ENT-0004)
  provider: string; // RutProveedor
  rut: string;
  lineNo: number;
  productCode: string;
  poNumber: string;
  batch: string;
  expDate: string;
  receptionDate?: string;
  expectedQty: number;
  receivedQty: number;
  uom: string;
  status: string;
  badge: string;
  numeroEntregas?: number;
  numeroLotes?: number;
  historialEntregas?: any[];
}

const Arrivals: React.FC = () => {
  const [orders, setOrders] = useState<ArrivalOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [filterProvider, setFilterProvider] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal / Selection
  const [selectedPA, setSelectedPA] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = () => {
      fetch('http://localhost:3000/api/v1/ol/inbound/received')
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            const flatData: any[] = [];
            data.data.forEach((cab: any) => {
              if (cab.Productos && cab.Productos.length > 0) {
                cab.Productos.forEach((prod: any) => {
                  flatData.push({ ...cab, ...prod });
                });
              } else {
                flatData.push({ ...cab });
              }
            });

            const mappedData = flatData.map((item: any) => {
              const diff = (item.CantidadRecibidaTotal || 0) - (item.CantidadEsperada || 0);
              let status = 'RECEPCIÓN COMPLETA';
              let badge = 'success';

              if (diff > 0) {
                status = 'SOBRANTE';
                badge = 'info';
              } else if (diff < 0) {
                status = 'FALTANTE';
                badge = 'warning';
              }

              if (item.Estado_Recepcion === 'PROCESADO') {
                status = 'Sincronizado SAP';
                badge = 'success';
              }

              const formatDate = (dateString: string) => {
                if (!dateString) return 'N/A';
                const date = new Date(dateString);
                return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace(' de ', ', ');
              };

              const entregas = item.EntregasParciales || [];
              const lotesSet = new Set(entregas.map((e: any) => e.lote).filter(Boolean));
              const numeroLotes = lotesSet.size;
              const lotePrincipal = (numeroLotes > 0 ? Array.from(lotesSet)[0] : 'N/A') as string;
              const fechaExpPrincipal = entregas.length > 0 ? entregas[0].vencimiento : null;

              return {
                rowId: `${item.NumeroEntrega}-${item.CodigoProducto}-${item.PosicionOrdenCompra}`,
                id: item.NumeroEntrega,
                provider: item.RutProveedor,
                rut: item.RutProveedor,
                lineNo: item.PosicionOrdenCompra,
                productCode: item.CodigoProducto,
                poNumber: item.NumeroOrdenCompra,
                batch: lotePrincipal,
                expDate: formatDate(fechaExpPrincipal),
                receptionDate: formatDate(item.FechaRecepcion),
                expectedQty: item.CantidadEsperada,
                receivedQty: item.CantidadRecibidaTotal || 0,
                uom: 'Un.',
                status: status,
                badge: badge,
                numeroEntregas: entregas.length,
                numeroLotes: numeroLotes,
                historialEntregas: entregas
              };
            });
            setOrders(mappedData);
          }
        })
        .catch(err => console.error("Error fetching received orders:", err))
        .finally(() => setIsLoading(false));
    };

    // Llamada inicial
    fetchData();

    // Polling silencioso cada 15 segundos
    const intervalId = setInterval(fetchData, 15000);

    // Limpieza al desmontar el componente
    return () => clearInterval(intervalId);
  }, []);

  const uniqueProviders = Array.from(new Set(orders.map(o => o.provider)));

  // Procesamiento de datos (Filtro) a nivel Línea
  const processedOrders = useMemo(() => {
    let result = orders.filter(line => {
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
          (line.batch && line.batch.toLowerCase().includes(term))
        );
      }
      return true;
    });

    return result;
  }, [orders, filterStatus, filterProvider, searchTerm]);

  // Paginar
  const totalPages = Math.ceil(processedOrders.length / itemsPerPage);
  const paginatedOrders = processedOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalRecepciones = Array.from(new Set(orders.map(o => o.id))).length;
  const totalDiscrepancias = Array.from(new Set(
    orders.filter(l => l.status === 'FALTANTE' || l.status === 'SOBRANTE').map(o => o.id)
  )).length;

  const handleOpenPanel = (rowId: string) => {
    setSelectedPA(rowId);
    setIsPanelOpen(true);
  };

  return (
    <>
      <Header showSearch={false} />
      <div className="split-page">
        <main className="main-column" style={{ padding: '24px 32px' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h2 className="page-title" style={{ fontSize: '1.4rem', marginBottom: '6px', letterSpacing: '-0.5px' }}>Confirmación de Recepción (OL)</h2>
              <p className="page-subtitle" style={{ fontSize: '0.9rem', margin: 0 }}>Verificación del Operador Logístico: mercancía que realmente ingresó al almacén comparada con el Pre Aviso.</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>ESTADOS:</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', fontWeight: 600 }}><span className="badge success" style={{ padding: '2px 6px' }}>RECEPCIÓN COMPLETA</span></span>
                <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', fontWeight: 600 }}><span className="badge warning" style={{ padding: '2px 6px' }}>CON DIFERENCIAS</span></span>
                <span style={{ width: '1px', height: '16px', background: 'var(--border-color)', margin: '0 4px' }}></span>
                <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', fontWeight: 600 }}><span className="badge draft" style={{ padding: '2px 6px' }}>PENDIENTE SAP</span></span>
                <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', fontWeight: 600 }}><span className="badge danger" style={{ padding: '2px 6px' }}>FALLO SAP</span></span>
                <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', fontWeight: 600 }}><span className="badge success" style={{ padding: '2px 6px' }}>SINCRONIZADO SAP</span></span>
              </div>
            </div>
          </div>

          <div className="metrics-container" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div className="metric-card" style={{ padding: '16px 24px', minHeight: 'unset', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: '8px', minWidth: '240px', flex: '0 1 auto' }}>
              <div className="metric-title" style={{ fontSize: '0.7rem' }}>RECEPCIONES TOTALES</div>
              <div className="metric-value" style={{ fontSize: '1.75rem', marginTop: '4px' }}>{totalRecepciones < 10 ? `0${totalRecepciones}` : totalRecepciones}</div>
            </div>
            <div className="metric-card" style={{ padding: '16px 24px', minHeight: 'unset', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: '8px', minWidth: '240px', flex: '0 1 auto' }}>
              <div className="metric-title" style={{ fontSize: '0.7rem' }}>DISCREPANCIAS (FALTANTE/SOBRANTE)</div>
              <div className="metric-value" style={{ fontSize: '1.75rem', marginTop: '4px', color: totalDiscrepancias > 0 ? 'var(--warning-text)' : 'inherit' }}>{totalDiscrepancias < 10 ? `0${totalDiscrepancias}` : totalDiscrepancias}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px', gap: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <div className="search-bar" style={{ width: '100%', maxWidth: '320px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Buscar Pre Avisos, OC, Lotes..." style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid var(--border-color)', background: 'var(--app-bg)', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', transition: 'all 0.2s' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--primary-main)'; }}
                onBlur={(e) => { e.currentTarget.style.background = 'var(--app-bg)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              />
            </div>

            <div className="filters" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="filter-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                PROVEEDOR:
                <select className="filter-select" value={filterProvider} onChange={(e) => { setFilterProvider(e.target.value); setCurrentPage(1); }} style={{ padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--app-bg)', maxWidth: '140px', fontSize: '0.8rem' }}>
                  <option value="TODOS">TODOS</option>
                  {uniqueProviders.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="filter-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                ESTADO:
                <select className="filter-select" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} style={{ padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--app-bg)', fontSize: '0.8rem' }}>
                  <option value="TODOS">TODOS</option>
                  <option value="RECEPCIÓN COMPLETA">RECEPCIÓN COMPLETA</option>
                  <option value="CON DIFERENCIAS">CON DIFERENCIAS</option>
                </select>
              </div>
            </div>
          </div>

          <div className="data-table-container" style={{ width: '100%', overflowX: 'auto', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <table style={{ width: '100%' }}>
              <colgroup>
                <col style={{ width: '9%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '7%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '4%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>PRE AVISO</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>PROVEEDOR</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>ORDEN COMPRA</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>CÓDIGO (ZCEN)</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>LOTE</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>VENCIMIENTO</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>ESPERADO</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>RECIBIDO</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>DIFERENCIA</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>ESTADO</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}></th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: '32px' }}>No hay resultados para el filtro seleccionado.</td></tr>
                ) : (
                  paginatedOrders.map((item, i) => {
                    const diff = item.receivedQty - item.expectedQty;

                    return (
                      <tr key={i} style={{ background: selectedPA === item.id ? 'var(--app-bg)' : 'transparent', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => { if (selectedPA !== item.id) e.currentTarget.style.background = 'var(--app-bg)'}} onMouseOut={e => { if (selectedPA !== item.id) e.currentTarget.style.background = 'transparent'}} onClick={() => handleOpenPanel(item.rowId)}>
                        <td style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>
                          {item.id}
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>CENABAST</div>
                        </td>
                        <td style={{ textAlign: 'left', padding: '12px 16px' }}>
                          <span style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{item.provider}</span>
                        </td>
                        <td style={{ textAlign: 'left', padding: '12px 16px' }}>
                          <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-main)', background: 'var(--app-bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                            {item.poNumber}
                          </span>
                        </td>
                        <td style={{ textAlign: 'left', padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.85rem' }}>{item.productCode}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Línea 0{item.lineNo}</div>
                        </td>
                        <td style={{ textAlign: 'left', padding: '12px 16px' }}>
                          {item.numeroLotes && item.numeroLotes > 1 ? (
                            <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--app-bg)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>Varios ({item.numeroLotes})</span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-secondary)', background: '#f8fafc', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>{item.batch}</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          <span>{item.numeroLotes && item.numeroLotes > 1 ? 'Múltiples' : item.expDate}</span>
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {item.expectedQty.toLocaleString()} Un.
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                          {item.receivedQty.toLocaleString()} Un.
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 16px', fontWeight: 600, color: diff > 0 ? 'var(--info-text)' : (diff < 0 ? 'var(--danger-text)' : 'inherit'), fontSize: '0.85rem' }}>
                          {diff > 0 ? '+' : ''}{diff !== 0 ? `${diff} Un.` : '-'}
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <span className={`badge ${item.badge}`} style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '12px', border: `1px solid var(--border-color)`, whiteSpace: 'nowrap' }}>{item.status}</span>
                            {item.numeroEntregas && item.numeroEntregas > 0 && (
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                ({item.numeroEntregas === 1 ? '1 entrega' : `${item.numeroEntregas} entregas`})
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                          <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <div className="table-footer">
              <div>
                Mostrando {paginatedOrders.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, processedOrders.length)} de {processedOrders.length} Registros
              </div>
              <div className="pagination">
                <button className="pagination-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                  <ChevronLeft size={16} />
                </button>
                <button className="pagination-btn" disabled={currentPage >= totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Modal de Detalles */}
        {isPanelOpen && (
          <div className="modal-overlay" onClick={() => setIsPanelOpen(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ width: '1000px', maxWidth: '95vw' }}>
              <div className="panel-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>Detalle de Recepción</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {selectedPA ? orders.find(o => o.rowId === selectedPA)?.id : ''}
                  </p>
                </div>
                <X size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsPanelOpen(false)} />
              </div>

              <div className="panel-content" style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                {selectedPA && orders.filter(o => o.rowId === selectedPA).map((line, idx) => {
                  const diff = line.receivedQty - line.expectedQty;
                  return (
                    <div key={idx} style={{ background: 'var(--sidebar-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Línea 0{line.lineNo} • CZEN: {line.productCode}</div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {(line.numeroEntregas || 0) > 0 && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, background: 'var(--app-bg)', padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Package size={12} />
                              {line.numeroEntregas === 1 ? '1 entrega' : `${line.numeroEntregas} entregas`}
                            </span>
                          )}
                          <span className={`badge ${line.badge}`}>{line.status}</span>
                        </div>
                      </div>

                      {/* Caja Interna Blanca (Agrupa Todo) */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr 1fr', gap: '12px', background: 'white', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Lote / Serie</div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                            {line.numeroLotes && line.numeroLotes > 1 ? (
                              <span style={{ color: 'var(--text-main)' }}>Varios Lotes ({line.numeroLotes})</span>
                            ) : (
                              <span style={{ fontFamily: 'monospace' }}>{line.batch}</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Vencimiento</div>
                          <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                            {line.numeroLotes && line.numeroLotes > 1 ? 'Múltiples' : line.expDate}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Cant. Esperada</div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{line.expectedQty} {line.uom}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Cant. Recibida</div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{line.receivedQty} {line.uom}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Diferencia</div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: diff > 0 ? 'var(--info-text)' : (diff < 0 ? 'var(--danger-text)' : 'var(--success-text)') }}>
                            {diff > 0 ? '+' : ''}{diff} {line.uom}
                          </div>
                        </div>
                      </div>

                      {line.numeroEntregas && line.numeroEntregas > 0 && line.historialEntregas && line.historialEntregas.length > 0 && (
                        <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>HISTORIAL DE RECEPCIONES ({line.numeroEntregas})</div>
                          <div style={{ overflowX: 'auto', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                              <thead style={{ background: 'var(--bg-color)' }}>
                                <tr>
                                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Fecha Recepción</th>
                                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Lote</th>
                                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Vencimiento</th>
                                  <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Cantidad Recibida</th>
                                </tr>
                              </thead>
                              <tbody>
                                {line.historialEntregas?.map((entrega, i) => (
                                  <tr key={i} style={{ borderBottom: i < ((line.historialEntregas?.length || 0) - 1) ? '1px solid var(--border-color)' : 'none', background: 'white' }}>
                                    <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                                      <Calendar size={12} style={{ display: 'inline', marginRight: 4, position: 'relative', top: 2 }} />
                                      {new Date(entrega.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 600 }}>{entrega.lote || '-'}</td>
                                    <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                                      {entrega.vencimiento ? new Date(entrega.vencimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace(' de ', ', ') : '-'}
                                    </td>
                                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--success-main)' }}>
                                      + {entrega.cantidad} {line.uom}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {diff !== 0 && (
                        <div style={{ display: 'flex', gap: '8px', padding: '12px', background: diff < 0 ? 'rgba(245, 158, 11, 0.05)' : 'rgba(14, 165, 233, 0.05)', border: diff < 0 ? '1px dashed var(--warning-text)' : '1px dashed var(--info-text)', borderRadius: '6px', marginTop: '16px', color: diff < 0 ? 'var(--warning-text)' : 'var(--info-text)', alignItems: 'flex-start' }}>
                          <AlertTriangle size={16} style={{ marginTop: '2px' }} />
                          <div style={{ fontSize: '0.85rem' }}>
                            <strong>{diff < 0 ? 'Pendientes de Entrega: ' : 'Sobran Unidades: '}</strong>
                            {diff < 0 
                              ? `Aún quedan ${Math.abs(diff)} ${line.uom} para completar esta posición de la orden de compra.` 
                              : `Se han recepcionado ${diff} ${line.uom} adicionales a la cantidad solicitada en la orden.`}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="panel-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'white' }}>
                <button className="btn" onClick={() => setIsPanelOpen(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Arrivals;
