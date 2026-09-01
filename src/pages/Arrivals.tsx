import React, { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import { ChevronLeft, ChevronRight, X, Search, Calendar, Package, Eye, FileText, CheckCircle, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/api';

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
  almacenSAP?: string;
  sapStatus?: string;
  sapBadge?: string;
  loteEsperado?: string;
  fechaExpEsperada?: string;
  loteRecibido?: string;
  fechaExpRecibida?: string;
  numeroEntregas?: number;
  numeroLotes?: number;
  historialEntregas?: any[];
}

const Arrivals: React.FC = () => {
  const [orders, setOrders] = useState<ArrivalOrder[]>([]);
  // const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [filterProvider, setFilterProvider] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Auth
  const { user } = useAuth();

  // Modal / Selection
  const [selectedPA, setSelectedPA] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Documentos
  const [documentsMap, setDocumentsMap] = useState<Record<string, any[]>>({});
  const [viewingDocId, setViewingDocId] = useState<number | null>(null);

  const fetchDocumentsForPOAndPreAviso = async (poNumber: string, preAviso: string) => {
    try {
      const res = await fetch(`${API_URL}/ol/inbound/documents/po/${poNumber}/${preAviso}`);
      const data = await res.json();
      if (data.status === 'success') {
        const key = `${poNumber}-${preAviso}`;
        setDocumentsMap(prev => ({ ...prev, [key]: data.data }));
      }
    } catch (e) {
      console.error('Error fetching documents', e);
    }
  };

  const lineaNegocio = user?.role === 'intermediacion' ? 'INT' : 'FP';

  useEffect(() => {
    const fetchData = () => {
      fetch(`${API_URL}/ol/inbound/received?lineaNegocio=${lineaNegocio}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            const flatData: any[] = [];
            data.data.forEach((cab: any) => {
              if (cab.lineas && cab.lineas.length > 0) {
                cab.lineas.forEach((prod: any) => {
                  flatData.push({ ...cab, ...prod });
                });
              } else {
                flatData.push({ ...cab });
              }
            });

            const mappedData = flatData.map((item: any) => {
              const diff = (item.cantidadRecibidaTotal || 0) - (item.cantidadEsperada || 0);
              let status = 'COMPLETA';
              let badge = 'success';

              if (item.cantidadRecibidaTotal === 0 || !item.cantidadRecibidaTotal) {
                status = 'PENDIENTE';
                badge = 'warning';
              } else if (diff < 0) {
                status = 'PARCIAL';
                badge = 'info';
              } else if (diff > 0) {
                status = 'SOBRANTE';
                badge = 'info';
              }

              let sapStatus = 'SINC. PENDIENTE';
              let sapBadge = 'warning';
              if (item.estadoRecepcion === 'PROCESADO_SAP' || item.estadoRecepcion === 'PROCESADO') {
                sapStatus = 'SINCRONIZADO';
                sapBadge = 'success';
              } else if (item.estadoRecepcion === 'ERROR' || item.estadoRecepcion === 'FALLIDO') {
                sapStatus = 'SINC. FALLIDA';
                sapBadge = 'danger';
              } else if (item.estadoRecepcion === 'ESPERANDO_LIBERACION') {
                sapStatus = 'ESP. LIBERACIÓN';
                sapBadge = 'info';
              }

              const formatDate = (dateString: string) => {
                if (!dateString) return 'N/A';
                const date = new Date(dateString);
                return date.toLocaleDateString('es-ES', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' }).replace(' de ', ', ');
              };

              const entregas = item.entregasParciales || [];
              const lotesSet = new Set(entregas.map((e: any) => e.lote).filter(Boolean));
              const numeroLotes = lotesSet.size;

              return {
                rowId: `${item.numeroPreAviso}-${item.codigoProducto}-${item.posicionPedidoCompra}`,
                id: item.numeroPreAviso,
                provider: item.rutProveedor,
                rut: item.rutProveedor,
                lineNo: item.posicionPedidoCompra,
                productCode: item.codigoProducto,
                poNumber: item.numeroPedidoCompra,
                loteEsperado: item.loteEsperado || '-',
                fechaExpEsperada: item.fechaVencimientoEsperada ? formatDate(item.fechaVencimientoEsperada) : '-',
                loteRecibido: entregas.length > 0 ? entregas[0].lote : '-',
                fechaExpRecibida: entregas.length > 0 && entregas[0].vencimiento ? formatDate(entregas[0].vencimiento) : '-',
                batch: entregas.length > 0 ? entregas[0].lote : (item.loteEsperado || '-'), // For backward compatibility/search
                expDate: entregas.length > 0 && entregas[0].vencimiento ? formatDate(entregas[0].vencimiento) : (item.fechaVencimientoEsperada ? formatDate(item.fechaVencimientoEsperada) : '-'), // For search
                receptionDate: formatDate(item.fechaRecepcion),
                expectedQty: Number(item.cantidadEsperada),
                receivedQty: Number(item.cantidadRecibidaTotal || 0),
                uom: 'Un.',
                status: status,
                badge: badge,
                sapStatus: sapStatus,
                sapBadge: sapBadge,
                documentoSAP: item.documentoSAP,
                numeroEntregas: entregas.length,
                numeroLotes: numeroLotes,
                almacenSAP: item.almacenSAP,
                historialEntregas: entregas
              };
            });
            setOrders(mappedData);
          }
        })
        .catch(err => console.error("Error fetching received orders:", err));
        // .finally(() => setIsLoading(false));
    };

    // Llamada inicial
    fetchData();

    // Polling silencioso cada 3 segundos
    const intervalId = setInterval(fetchData, 3000);

    // Limpieza al desmontar el componente
    return () => clearInterval(intervalId);
  }, [lineaNegocio]);

  const uniqueProviders = Array.from(new Set(orders.map(o => o.provider)));

  // Procesamiento de datos (Filtro) a nivel Línea
  const processedOrders = useMemo(() => {
    let result = orders.filter(line => {
      // Filtro de negocio por rol de usuario
      const numAlmacen = parseInt(line.almacenSAP || '0', 10);
      
      if (user?.role === 'intermediacion') {
        if (numAlmacen < 6001 || numAlmacen > 6099) return false;
      } else if (user?.role === 'farmacias') {
        if (numAlmacen < 6101) return false;
      }
      
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

  const selectedLines = useMemo(() => {
    return processedOrders.filter(o => o.rowId === selectedPA);
  }, [processedOrders, selectedPA]);

  useEffect(() => {
    if (isPanelOpen && selectedLines.length > 0) {
      const uniqueCombos = new Set<string>();
      selectedLines.forEach(line => {
        const combo = `${line.poNumber}|${line.id}`;
        if (!uniqueCombos.has(combo)) {
          uniqueCombos.add(combo);
          fetchDocumentsForPOAndPreAviso(line.poNumber, line.id);
        }
      });
    }
  }, [isPanelOpen, selectedLines]);

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

  const handleLiberar = async (numeroPreAviso?: string) => {
    if (!numeroPreAviso) return;
    try {
      const res = await fetch(`${API_URL}/ol/inbound/received/${numeroPreAviso}/liberar`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        alert(data.message);
      } else {
        alert(data.message || 'Error al liberar');
      }
    } catch (e) {
      alert('Error de conexión al liberar');
    }
  };

  return (
    <>
      <Header showSearch={false} />
      <div className="split-page">
        <main className="main-column" style={{ padding: '24px 32px' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h2 className="page-title" style={{ fontSize: '1.4rem', marginBottom: '6px', letterSpacing: '-0.5px' }}>Recepción de Mercancía</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>ESTADOS:</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', fontWeight: 400 }}><span className="badge success" style={{ padding: '2px 6px' }}>RECEPCIÓN COMPLETA</span></span>
                <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', fontWeight: 400 }}><span className="badge warning" style={{ padding: '2px 6px' }}>CON DIFERENCIAS</span></span>
                <span style={{ width: '1px', height: '16px', background: 'var(--border-color)', margin: '0 4px' }}></span>
                <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', fontWeight: 400 }}><span className="badge warning" style={{ padding: '2px 6px' }}>SINC. PENDIENTE</span></span>
                <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', fontWeight: 400 }}><span className="badge info" style={{ padding: '2px 6px', background: '#3b82f6', color: 'white' }}>ESP. LIBERACIÓN</span></span>
                <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', fontWeight: 400 }}><span className="badge danger" style={{ padding: '2px 6px' }}>SINC. FALLIDA</span></span>
                <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', fontWeight: 400 }}><span className="badge success" style={{ padding: '2px 6px' }}>SINCRONIZADO</span></span>
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
              <div className="filter-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 400 }}>
                PROVEEDOR:
                <select className="filter-select" value={filterProvider} onChange={(e) => { setFilterProvider(e.target.value); setCurrentPage(1); }} style={{ padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--app-bg)', maxWidth: '140px', fontSize: '0.8rem' }}>
                  <option value="TODOS">TODOS</option>
                  {uniqueProviders.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="filter-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 400 }}>
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
                <col style={{ width: '8%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '3%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>PRE AVISO</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>RUT PROV.</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>P. COMPRA</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>ALM</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>MATERIAL</th>
                  <th style={{ textAlign: 'left', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>LOTE</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '0.75rem', fontWeight: 600 }}>F. VENCIMIENTO</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>ESPERADO</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>RECIBIDO</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>PENDIENTE</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>RECEPCIÓN</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>ESTADO SAP</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', whiteSpace: 'normal', fontSize: '0.75rem', fontWeight: 600 }}>ACCION</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: '32px' }}>No hay resultados para el filtro seleccionado.</td></tr>
                ) : (
                  paginatedOrders.map((item, i) => {
                    const diff = Number((item.receivedQty - item.expectedQty).toFixed(3));

                    return (
                      <tr key={i} style={{ background: selectedPA === item.id ? 'var(--app-bg)' : 'transparent', transition: 'background 0.2s' }} onMouseOver={e => { if (selectedPA !== item.id) e.currentTarget.style.background = 'var(--app-bg)'}} onMouseOut={e => { if (selectedPA !== item.id) e.currentTarget.style.background = 'transparent'}}>
                        <td style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 400 }}>
                          {item.id}
                        </td>
                        <td style={{ textAlign: 'left', padding: '12px 16px' }}>
                          <span style={{ color: 'var(--text-main)', fontSize: '0.85rem' }}>{item.provider}</span>
                        </td>
                        <td style={{ textAlign: 'left', padding: '12px 16px' }}>
                          <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 400, color: 'var(--primary-main)', background: 'var(--app-bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                            {item.poNumber}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {item.almacenSAP || '-'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'left', padding: '12px 16px' }}>
                          <div style={{ fontWeight: 400, color: 'var(--text-main)', fontSize: '0.85rem' }}>{item.productCode.replace(/^FI/, '')}</div>
                        </td>
                        <td style={{ textAlign: 'left', padding: '12px 16px' }}>
                          {item.numeroLotes && item.numeroLotes > 1 ? (
                            <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 400, color: 'var(--text-secondary)', background: 'var(--app-bg)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>Varios ({item.numeroLotes})</span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 400, color: 'var(--text-secondary)', background: '#f8fafc', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>{item.batch}</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          <span>{item.numeroLotes && item.numeroLotes > 1 ? 'Múltiples' : item.expDate}</span>
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {item.expectedQty.toLocaleString('es-CL')} Un.
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 16px', fontWeight: 400, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                          {item.receivedQty.toLocaleString('es-CL')} Un.
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 16px', fontWeight: 400, color: diff > 0 ? 'var(--info-text)' : (diff < 0 ? 'var(--danger-text)' : 'inherit'), fontSize: '0.85rem' }}>
                          {diff !== 0 ? `${diff > 0 ? '+' : ''}${diff.toLocaleString('es-CL')} Un.` : '-'}
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                          <span className={`badge ${item.badge}`}>{item.status}</span>
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                          <span className={`badge ${item.sapBadge}`}>{item.sapStatus}</span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', cursor: 'pointer' }} onClick={() => handleOpenPanel(item.rowId)}>
                          <Eye size={18} style={{ color: 'var(--primary-main)' }} />
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {selectedPA && orders.find(o => o.rowId === selectedPA)?.sapStatus === 'ESP. LIBERACIÓN' && (
                    <button 
                      onClick={() => handleLiberar(orders.find(o => o.rowId === selectedPA)?.id)}
                      style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}
                    >
                      Liberar a SAP
                    </button>
                  )}
                  <X size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsPanelOpen(false)} />
                </div>
              </div>

              <div className="panel-content" style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                {selectedPA && orders.filter(o => o.rowId === selectedPA).map((line, idx) => {
                  const diff = Number((line.receivedQty - line.expectedQty).toFixed(3));
                  return (
                    <div key={idx} style={{ background: 'var(--sidebar-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>

                      {/* Caja Interna Blanca (Agrupa Todo) */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                        {/* Card 1: Avisado */}
                        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FileText size={14} /> LO AVISADO (PREAVISO)
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>POSICIÓN</span>
                              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{line.lineNo}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MATERIAL</span>
                              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{line.productCode.replace(/^FI/, '')}</span>
                            </div>
                            <div style={{ height: '1px', background: 'var(--border-color)', opacity: 0.5 }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CANTIDAD</span>
                              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{line.expectedQty.toLocaleString('es-CL')} {line.uom}</span>
                            </div>
                            <div style={{ height: '1px', background: 'var(--border-color)', opacity: 0.5 }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LOTE</span>
                              <span style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{line.loteEsperado}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>VENCIMIENTO</span>
                              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{line.fechaExpEsperada}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card 3: Diferencia */}
                        <div style={{ background: diff === 0 ? 'white' : (diff > 0 ? '#f0fdf4' : 'rgba(245, 158, 11, 0.05)'), padding: '16px', borderRadius: '8px', border: `1px solid ${diff === 0 ? 'var(--border-color)' : (diff > 0 ? '#bbf7d0' : '#fcd34d')}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: diff === 0 ? 'var(--text-muted)' : (diff > 0 ? 'var(--success-main)' : 'var(--warning-main)'), marginBottom: '8px' }}>
                            {diff > 0 ? 'SOBRANTE' : 'PENDIENTE DE RECEPCIÓN'}
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: diff === 0 ? 'var(--text-main)' : (diff > 0 ? 'var(--success-main)' : 'var(--warning-main)') }}>
                            {diff > 0 ? '+' : ''}{diff.toLocaleString('es-CL')} {line.uom}
                          </div>

                          {diff === 0 && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              Recepción conforme
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '16px' }}>
                            {(line.numeroEntregas || 0) > 0 && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, background: 'var(--app-bg)', padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Package size={12} />
                                {line.numeroEntregas === 1 ? '1 entrega' : `${line.numeroEntregas} entregas`}
                              </span>
                            )}
                            <span className={`badge ${line.badge}`}>{line.status}</span>
                          </div>
                        </div>
                      </div>

                      {line.numeroEntregas && line.numeroEntregas > 0 && line.historialEntregas && line.historialEntregas.length > 0 && (
                        <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-main)', marginBottom: '12px' }}>HISTORIAL DE RECEPCIONES ({line.numeroEntregas})</div>
                          <div style={{ overflowX: 'auto', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                              <thead style={{ background: 'var(--bg-color)' }}>
                                <tr>
                                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>FECHA RECEPCIÓN</th>
                                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>LOTE</th>
                                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>FECHA VENCIMIENTO</th>
                                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>ALMACÉN</th>
                                  <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>DOC. SAP</th>
                                  <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>CANTIDAD RECIBIDA</th>
                                  <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>ESTADO SAP</th>
                                </tr>
                              </thead>
                              <tbody>
                                {line.historialEntregas?.map((entrega, i) => (
                                  <tr key={i} style={{ borderBottom: i < ((line.historialEntregas?.length || 0) - 1) ? '1px solid var(--border-color)' : 'none', background: 'white' }}>
                                    <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                                      <Calendar size={12} style={{ display: 'inline', marginRight: 4, position: 'relative', top: 2 }} />
                                      {new Date(entrega.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 400 }}>{entrega.lote || '-'}</td>
                                    <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                                      {entrega.vencimiento ? new Date(entrega.vencimiento).toLocaleDateString('es-ES', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' }).replace(' de ', ', ') : '-'}
                                    </td>
                                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 400 }}>
                                      {entrega.almacenSAP || '-'}
                                    </td>
                                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: 400, color: 'var(--primary-main)' }}>
                                      {entrega.docSAP || '-'}
                                    </td>
                                    <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 400, color: 'var(--success-main)' }}>
                                      + {Number(entrega.cantidad).toLocaleString('es-CL')} {line.uom}
                                    </td>
                                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                      {(() => {
                                        if (entrega.estadoSAP === 'PROCESADO_SAP' || entrega.estadoSAP === 'PROCESADO') {
                                          return <span className="badge success">SINCRONIZADO</span>;
                                        } else if (entrega.estadoSAP === 'ERROR' || entrega.estadoSAP === 'FALLIDO') {
                                          return <span className="badge danger">SINC. FALLIDA</span>;
                                        } else {
                                          return <span className="badge warning">SINC. PENDIENTE</span>;
                                        }
                                      })()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* DOCUMENTOS ADJUNTOS DESDE LA DB */}
                      <div className="panel-section-title" style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-main)', letterSpacing: '1px', marginBottom: '16px', marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <FileText size={16} />
                        DOCUMENTOS ADJUNTOS
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', paddingBottom: '16px' }}>
                        {(!documentsMap[`${line.poNumber}-${line.id}`] || documentsMap[`${line.poNumber}-${line.id}`].length === 0) ? (
                            <div style={{ textAlign: 'center', padding: '24px', background: '#f8fafc', borderRadius: '6px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.85rem' }}>
                                No hay documentos adjuntos para este Pedido de Compra todavía.
                            </div>
                        ) : (
                            documentsMap[`${line.poNumber}-${line.id}`].map((doc: any, idx: number) => (
                              <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-color)' }}>
                                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <CheckCircle size={20} color="var(--success-text)" />
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{doc.tipoDocumento.replace('_', ' ')}</div>
                                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        Asociado a Pedido: <span style={{ fontFamily: 'monospace', color: 'var(--primary-main)' }}>{doc.numeroPedidoCompra}</span> | Preaviso: <span style={{ fontFamily: 'monospace', color: 'var(--primary-main)' }}>{doc.numeroPreAviso}</span>
                                      </div>
                                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        Subido el {(() => {
                                          if (!doc.fechaSubida) return 'N/A';
                                          const d = new Date(doc.fechaSubida);
                                          const fechaStr = d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                          const horaStr = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
                                          return `${fechaStr} a las ${horaStr} hrs`;
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                  <button onClick={() => viewingDocId === doc.id ? setViewingDocId(null) : setViewingDocId(doc.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: viewingDocId === doc.id ? 'var(--bg-color)' : 'white', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-main)', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-color)' }} onMouseOut={(e) => { e.currentTarget.style.background = viewingDocId === doc.id ? 'var(--bg-color)' : 'white' }}>
                                     {viewingDocId === doc.id ? <><X size={16} /> CERRAR VISTA</> : <><Eye size={16} /> VER DOCUMENTO</>}
                                  </button>
                                </div>
                                
                                {/* VISOR INLINE */}
                                {viewingDocId === doc.id && (
                                  <div style={{ marginTop: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                                    <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' }}>
                                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Eye size={14} /> Vista Previa
                                      </div>
                                      <a href={`${API_URL}/ol/inbound/documents/file/${doc.id}?download=true`} download style={{ textDecoration: 'none', background: 'white', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-color)' }} onMouseOut={(e) => { e.currentTarget.style.background = 'white' }}>
                                        <Download size={14} /> DESCARGAR
                                      </a>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                                      {['png', 'jpg', 'jpeg', 'gif', 'webp'].includes((doc.extensionArchivo || '').toLowerCase()) ? (
                                        <img 
                                          src={`${API_URL}/ol/inbound/documents/file/${doc.id}`} 
                                          alt={`Documento ${doc.nombreArchivo}`}
                                          style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', display: 'block', margin: '0 auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        />
                                      ) : (
                                        <iframe 
                                          src={`${API_URL}/ol/inbound/documents/file/${doc.id}`} 
                                          style={{ width: '100%', height: '600px', border: 'none', display: 'block', backgroundColor: 'white' }} 
                                          title={`Documento ${doc.nombreArchivo}`}
                                        />
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

              <div className="panel-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'white' }}>
                <button className="btn" onClick={() => setIsPanelOpen(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '6px', fontWeight: 400, cursor: 'pointer' }}>
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
