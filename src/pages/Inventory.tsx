import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Download, ChevronDown, ChevronLeft, ChevronRight, X, Package, FileText, Search, Database, RefreshCw, ArrowRightLeft, ArrowRight, Building2, User, Calendar, CheckCircle2, Activity, RefreshCcw, Hexagon, AlertCircle, XCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLocation } from 'react-router-dom';
import { MovementDetailModal } from '../components/inventory/MovementDetailModal';

export interface SapLog {
  IdLog: number;
  Modulo: string;
  Referencia_ID: number;
  Folio_Documento?: string;
  Fecha_Ejecucion: string;
  Estado: string;
  Payload_Enviado?: string;
  Respuesta_SAP?: string;
  Documento_Material_SAP?: string;
  Usuario_OL?: string;
}

export interface AdjustmentDetail {
  ID?: number;
  Cabecera_ID?: number;
  Codigo_Material: string;
  Lote_SAP: string;
  Cantidad: number;
  Motivo: string;
  Tipo_Movimiento: string;
  Numero_OC?: string;
  Posicion_OC?: number;
  Almacen_Origen?: string;
  Almacen_Destino?: string;
}

export interface AdjustmentHeader {
  ID: number;
  Nro_Ajuste: string;
  Centro?: string;
  Usuario_OL: string;
  Linea_Negocio?: string;
  Fecha_Creacion: string;
  Estado_SAP?: string;
  Mensaje_Error_SAP?: string;
  Documento_SAP_Ref?: string;
  detalles: AdjustmentDetail[];
  logsSap?: SapLog[];
}

const Inventory: React.FC = () => {
  const [adjustments, setAdjustments] = useState<AdjustmentHeader[]>([]);
  const [totalAjustes, setTotalAjustes] = useState(0);
  const [loading, setLoading] = useState(true);

  const [motivoModal, setMotivoModal] = useState<string | null>(null);
  const [mermasFechaDesde, setMermasFechaDesde] = useState<string>('');
  const [mermasFechaHasta, setMermasFechaHasta] = useState<string>('');
  const [inputFechaDesde, setInputFechaDesde] = useState<string>('');
  const [inputFechaHasta, setInputFechaHasta] = useState<string>('');
  const [flujoPeriodo, setFlujoPeriodo] = useState<number>(14);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTipoMov, setSelectedTipoMov] = useState<string>('TODOS');
  const [selectedTipoStock, setSelectedTipoStock] = useState<string>('TODOS');
  const [selectedAjuste, setSelectedAjuste] = useState<{ header: AdjustmentHeader, detalle: AdjustmentDetail } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const location = useLocation();

  let activeTab: 'generales' | 'traspasos' | 'mermas' | 'conteos' | 'muestras' | 'entradas-especiales' = 'generales';
  if (location.pathname.includes('/traspasos')) {
    activeTab = 'traspasos';
  } else if (location.pathname.includes('/mermas')) {
    activeTab = 'mermas';
  } else if (location.pathname.includes('/conteos')) {
    activeTab = 'conteos';
  } else if (location.pathname.includes('/muestras')) {
    activeTab = 'muestras';
  } else if (location.pathname.includes('/entradas-especiales')) {
    activeTab = 'entradas-especiales';
  }

  const fetchAdjustments = () => {
    setLoading(true);
    fetch('http://localhost:3000/api/v1/ol/inventory/adjustments?limit=1000')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data) {
          setAdjustments(data.data.data || []);
          setTotalAjustes(data.data.total || 0);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error obteniendo ajustes:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAdjustments();
  }, []);

  const getMovimientoTypeBadge = (mov: string, origen?: string, destino?: string) => {
    if (mov === '311' || (origen && destino && origen !== destino)) {
      return { label: 'TRASPASO (311)', bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
    } else if (mov === '321') {
      return { label: 'LIBERADO (321)', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
    } else if (mov === '344') {
      return { label: 'CUARENTENA (344)', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
    } else if (mov === '343') {
      return { label: 'DESBLOQUEO (343)', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
    } else if (mov === '309') {
      return { label: 'RECLASIF. SKU (309)', bg: '#f3e8ff', color: '#6b21a8', border: '#e9d5ff' };
    } else if (mov === '555' || mov === '556') {
      return { label: 'DESGUACE (555)', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
    } else if (mov === '711' || mov === '717') {
      return { label: 'FALTANTE (711)', bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
    } else if (mov === '712' || mov === '718') {
      return { label: 'SOBRANTE (712)', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
    } else if (mov === '331' || mov === '333') {
      return { label: 'MUESTREO (331)', bg: '#e0e7ff', color: '#4338ca', border: '#c7d2fe' };
    } else if (mov === '511') {
      return { label: 'ENTRADA SIN OC (511)', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
    }
    return { label: `MOV ${mov}`, bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
  };

  const filteredAdjustments = adjustments.filter(header => {
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

    if (activeTab === 'traspasos') {
      const tieneTraspaso = header.detalles.some(d => ['311', '321', '344', '343', '309'].includes(d.Tipo_Movimiento) || (d.Almacen_Origen && d.Almacen_Destino));
      if (!tieneTraspaso) return false;
    } else if (activeTab === 'mermas') {
      const tieneMerma = header.detalles.some(d => (d.Cantidad < 0 && !['711', '717'].includes(d.Tipo_Movimiento)) || d.Tipo_Movimiento === '555');
      if (!tieneMerma) return false;
    } else if (activeTab === 'conteos') {
      const tieneConteo = header.detalles.some(d => ['711', '712', '717', '718'].includes(d.Tipo_Movimiento));
      if (!tieneConteo) return false;
    } else if (activeTab === 'muestras') {
      const tieneMuestra = header.detalles.some(d => ['331', '333'].includes(d.Tipo_Movimiento));
      if (!tieneMuestra) return false;
    } else if (activeTab === 'entradas-especiales') {
      const tieneEspecial = header.detalles.some(d => d.Tipo_Movimiento === '511');
      if (!tieneEspecial) return false;
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

  return (
    <>
      <Header showSearch={false} />
      <main className="page-content">
        <h2 className="page-title">
          {activeTab === 'traspasos' && 'Reubicaciones y Traspasos Internos (SAP 311, 321, 344, 343, 309)'}
          {activeTab === 'mermas' && 'Mermas, Desguaces y Destrucción (SAP 555)'}
          {activeTab === 'conteos' && 'Conteos Cíclicos y Diferencias de Inventario (SAP 711, 712)'}
          {activeTab === 'muestras' && 'Control de Calidad y Muestreos ISP (SAP 331, 333)'}
          {activeTab === 'entradas-especiales' && 'Entradas Especiales sin OC (SAP 511)'}
          {activeTab === 'generales' && 'Registros y Movimientos Generales WMS / SAP'}
        </h2>
        <p className="page-subtitle">
          {activeTab === 'traspasos' && 'Traslados entre almacenes, cuarentena, liberaciones de calidad y reetiquetado de SKU.'}
          {activeTab === 'mermas' && 'Registro y auditoría de salidas por medicamentos destruidos, dañados o vencidos con Centro de Costos.'}
          {activeTab === 'conteos' && 'Monitoreo de sobrantes (+) y faltantes (-) derivados de tomas de inventario físico periódico.'}
          {activeTab === 'muestras' && 'Registro de unidades físicas retiradas para ensayos microbiológicos e inspección ISP.'}
          {activeTab === 'entradas-especiales' && 'Ingresos extraordinarios a título gratuito, donaciones o regularizaciones administrativas.'}
          {activeTab === 'generales' && 'Consolidador general de movimientos de inventario con auditoría BAPI_GOODSMVT_CREATE.'}
        </p>

        {(() => {
          const totalDetalles = adjustments.reduce((acc, header) => acc + header.detalles.length, 0);
          const salidasStock = adjustments.reduce((acc, header) =>
            acc + header.detalles.filter(d => d.Cantidad < 0).reduce((sum, d) => sum + Math.abs(d.Cantidad), 0)
            , 0);
          const entradasStock = adjustments.reduce((acc, header) =>
            acc + header.detalles.filter(d => d.Cantidad > 0).reduce((sum, d) => sum + d.Cantidad, 0)
            , 0);
          const impactoNeto = entradasStock - salidasStock;

          const traspasoHeaders = adjustments.filter(h => h.detalles.some(d => ['311', '321', '344', '309'].includes(d.Tipo_Movimiento) || (d.Almacen_Origen && d.Almacen_Destino)));
          let sapSincronizados = 0;
          let sapErrores = 0;
          let sapPendientes = 0;

          traspasoHeaders.forEach(h => {
            const est = (h.Estado_SAP || '').toUpperCase();
            if (est === 'PROCESADO' || est === 'EXITOSO' || est === 'COMPLETADO') {
              sapSincronizados++;
            } else if (est.includes('ERROR') || est.includes('FALLO')) {
              sapErrores++;
            } else {
              sapPendientes++;
            }
          });
          const successRate = traspasoHeaders.length > 0 ? Math.round((sapSincronizados / traspasoHeaders.length) * 100) : 100;

          let traspasosConFecha = adjustments.flatMap(h =>
            h.detalles
              .filter(d => ['311', '321', '344', '343', '309'].includes(d.Tipo_Movimiento) || (d.Almacen_Origen && d.Almacen_Destino))
              .map(d => ({ ...d, fechaObj: new Date(h.Fecha_Creacion) }))
          );

          const flujoCutoff = new Date();
          flujoCutoff.setDate(flujoCutoff.getDate() - (flujoPeriodo - 1));
          flujoCutoff.setHours(0, 0, 0, 0);
          
          const traspasosFiltrados = traspasosConFecha.filter(t => t.fechaObj >= flujoCutoff);
          const volumenTraspasado = traspasosFiltrados.reduce((sum, d) => sum + Math.abs(d.Cantidad), 0);
          const totalTraspasos = traspasosFiltrados.length;

          const groupedTraspasos = traspasosConFecha.reduce((acc, curr) => {
            const dateStr = curr.fechaObj.toISOString().split('T')[0];
            acc[dateStr] = (acc[dateStr] || 0) + Math.abs(curr.Cantidad);
            return acc;
          }, {} as Record<string, number>);

          let traspasosChartData = [];
          for (let i = flujoPeriodo - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const qty = groupedTraspasos[dateStr] || 0;

            traspasosChartData.push({
              name: d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
              Unidades: qty
            });
          }

          let mermasConFecha = adjustments.flatMap(h =>
            h.detalles
              .filter(d => d.Cantidad < 0 || d.Tipo_Movimiento === '555')
              .map(d => ({ ...d, fechaObj: new Date(h.Fecha_Creacion) }))
          );

          if (mermasFechaDesde) {
            const desde = new Date(mermasFechaDesde);
            desde.setHours(0, 0, 0, 0);
            mermasConFecha = mermasConFecha.filter(m => new Date(m.fechaObj) >= desde);
          }
          if (mermasFechaHasta) {
            const hasta = new Date(mermasFechaHasta);
            hasta.setHours(23, 59, 59, 999);
            mermasConFecha = mermasConFecha.filter(m => new Date(m.fechaObj) <= hasta);
          }

          const grouped = mermasConFecha.reduce((acc, curr) => {
            const dateStr = curr.fechaObj.toISOString().split('T')[0];
            acc[dateStr] = (acc[dateStr] || 0) + Math.abs(curr.Cantidad);
            return acc;
          }, {} as Record<string, number>);

          let chartData = [];
          if (mermasFechaDesde || mermasFechaHasta) {
            let start = mermasFechaDesde ? new Date(mermasFechaDesde) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            let end = mermasFechaHasta ? new Date(mermasFechaHasta) : new Date();

            if (isNaN(start.getTime())) start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            if (isNaN(end.getTime())) end = new Date();

            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            const diffDays = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

            for (let i = 0; i <= Math.min(diffDays, 180); i++) {
              const d = new Date(start);
              d.setDate(d.getDate() + i);
              const dateStr = d.toISOString().split('T')[0];
              const qty = grouped[dateStr] || 0;
              chartData.push({
                name: d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
                Unidades: qty
              });
            }
          } else {
            for (let i = 29; i >= 0; i--) { // Aumentado a 30 dias por defecto para ver mas historial
              const d = new Date();
              d.setDate(d.getDate() - i);
              const dateStr = d.toISOString().split('T')[0];
              const qty = grouped[dateStr] || 0;

              chartData.push({
                name: d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
                Unidades: qty
              });
            }
          }

          return (
            <>
              {/* TARJETAS DE MÉTRICAS */}
              {activeTab === 'generales' && (
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
              )}

              {activeTab === 'traspasos' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>

                  {/* LEYENDAS SUPERIORES (STOCK Y SAP) */}
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {/* CLASIFICACIÓN DE STOCK */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 24px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
                        <Hexagon size={16} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.5px' }}>TIPO STOCK</span>
                      </div>
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #22c55e', background: '#dcfce7' }}></div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>L.UTILIZACION</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #facc15', background: '#fef9c3' }}></div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>C.CALIDAD</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #f87171', background: '#fee2e2' }}></div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Bloqueado</span>
                        </div>
                      </div>
                    </div>

                    {/* SALUD DE INTERFAZ SAP */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 24px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
                        <RefreshCcw size={16} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.5px' }}>ESTADOS SAP</span>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Éxito: <span style={{ color: '#059669', fontWeight: 700 }}>{successRate}%</span></span>
                          <div style={{ width: '60px', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
                            <div style={{ width: `${successRate}%`, background: '#10b981', height: '100%' }}></div>
                            <div style={{ width: `${100 - successRate}%`, background: '#fbbf24', height: '100%' }}></div>
                          </div>
                        </div>
                        <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }}></div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '20px' }}>
                            <CheckCircle2 size={12} color="#22c55e" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534' }}>Sincronizado</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534' }}>{sapSincronizados}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fffbeb', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '20px' }}>
                            <AlertCircle size={12} color="#f59e0b" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#b45309' }}>Pendiente</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309' }}>{sapPendientes}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fef2f2', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '20px' }}>
                            <XCircle size={12} color="#ef4444" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#991b1b' }}>Error</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#991b1b' }}>{sapErrores}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD GRANDE: FLUJO DE MATERIALES */}
                  <div style={{ background: 'white', padding: '20px 24px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', minHeight: '200px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', marginBottom: '4px' }}>
                          <Activity size={14} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.5px' }}>FLUJO DE MATERIALES</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
                            {totalTraspasos} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>Movimientos realizados</span>
                          </div>
                        </div>
                      </div>
                      <select 
                        value={flujoPeriodo} 
                        onChange={(e) => setFlujoPeriodo(Number(e.target.value))}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: '#334155', outline: 'none', background: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <option value={7}>Últimos 7 Días</option>
                        <option value={14}>Últimos 14 Días</option>
                        <option value={30}>Últimos 30 Días</option>
                      </select>
                    </div>

                    <div style={{ height: '140px', width: '100%', marginTop: 'auto' }}>
                      {traspasosChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={traspasosChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorFlujo2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <Tooltip
                              contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '0.85rem' }}
                              itemStyle={{ color: '#3b82f6', fontWeight: 600 }}
                              labelStyle={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '4px' }}
                              formatter={(value: any) => [`${value ?? 0} Un.`, 'Volumen']}
                            />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} dy={10} />
                            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} dx={-10} width={40} />
                            <Area type="monotone" dataKey="Unidades" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorFlujo2)" activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div style={{ width: '100%', height: '100%', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', background: 'var(--app-bg)', borderRadius: '6px' }}>
                          Sin movimientos recientes
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'mermas' && (
                <>
                  <div style={{ background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Evolución de Destrucción y Desguaces (SAP 555)</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tendencia temporal de medicamentos descontados del inventario por bajas o daño.</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger-main)', lineHeight: 1 }}>{salidasStock.toLocaleString()} Un.</span>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600, textTransform: 'uppercase' }}>Pérdida Total</div>
                      </div>
                    </div>

                    <div style={{ height: '240px', width: '100%' }}>
                      {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorMermasFull" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--danger-main)" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="var(--danger-main)" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Tooltip
                              contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '0.85rem' }}
                              itemStyle={{ color: 'var(--danger-main)', fontWeight: 600 }}
                              labelStyle={{ color: 'var(--text-main)', fontWeight: 600, marginBottom: '4px' }}
                              formatter={(value: any) => [`${value ?? 0} Unidades`, 'Pérdida']}
                            />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} dy={10} />
                            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} dx={-10} allowDecimals={false} tickFormatter={(value) => value.toLocaleString('es-CL')} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                            <Area type="monotone" dataKey="Unidades" stroke="var(--danger-main)" strokeWidth={3} fillOpacity={1} fill="url(#colorMermasFull)" activeDot={{ r: 6, strokeWidth: 2, stroke: 'white' }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div style={{ width: '100%', height: '100%', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', background: 'var(--app-bg)', borderRadius: '6px' }}>
                          Sin mermas registradas
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'conteos' && (
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
              )}

              {activeTab === 'muestras' && (
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <div className="metric-card" style={{ padding: '16px 20px', minHeight: 'unset', flex: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div className="metric-title" style={{ fontSize: '0.7rem' }}>MUESTRAMIENTOS RETIRADOS</div>
                    <div className="metric-value" style={{ fontSize: '1.75rem', marginTop: '4px', color: '#4338ca' }}>{totalDetalles}</div>
                  </div>
                  <div className="metric-card" style={{ padding: '16px 20px', minHeight: 'unset', flex: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div className="metric-title" style={{ fontSize: '0.7rem' }}>CLASE SAP</div>
                    <div className="metric-value" style={{ fontSize: '1.75rem', marginTop: '4px' }}>331 / 333</div>
                  </div>
                </div>
              )}

              {activeTab === 'entradas-especiales' && (
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <div className="metric-card" style={{ padding: '16px 20px', minHeight: 'unset', flex: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div className="metric-title" style={{ fontSize: '0.7rem' }}>INGRESOS A TÍTULO GRATUITO</div>
                    <div className="metric-value" style={{ fontSize: '1.75rem', marginTop: '4px', color: '#047857' }}>+{entradasStock} Un.</div>
                  </div>
                  <div className="metric-card" style={{ padding: '16px 20px', minHeight: 'unset', flex: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div className="metric-title" style={{ fontSize: '0.7rem' }}>CLASE SAP</div>
                    <div className="metric-value" style={{ fontSize: '1.75rem', marginTop: '4px' }}>511 (Entrada sin OC)</div>
                  </div>
                </div>
              )}
            </>
          );
        })()}

        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '16px', gap: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div className="search-bar" style={{ width: '100%', maxWidth: '360px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar Folio, ZCEN, Lote, Doc. SAP..."
              style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid var(--border-color)', background: 'var(--app-bg)', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', transition: 'all 0.2s' }}
              onFocus={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--primary-main)'; }}
              onBlur={(e) => { e.currentTarget.style.background = 'var(--app-bg)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            />
          </div>

          <div className="filters" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>

            {activeTab === 'generales' && (
              <div className="filter-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                OPERACIÓN SAP:
                <select
                  value={selectedTipoMov}
                  onChange={(e) => setSelectedTipoMov(e.target.value)}
                  className="filter-select"
                  style={{ padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--app-bg)', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="TODOS">Todas las Operaciones</option>
                  <option value="311">Traspasos (311)</option>
                  <option value="555">Mermas / Desguace (555)</option>
                  <option value="711">Faltante Conteo (711)</option>
                  <option value="712">Sobrante Conteo (712)</option>
                  <option value="331">Muestreo ISP (331)</option>
                  <option value="511">Entrada Sin OC (511)</option>
                </select>
              </div>
            )}

            {activeTab === 'mermas' && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>DESDE:</span>
                <input type="date" value={inputFechaDesde} onChange={(e) => setInputFechaDesde(e.target.value)} style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.8rem', background: 'white', outline: 'none' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>HASTA:</span>
                <input type="date" value={inputFechaHasta} onChange={(e) => setInputFechaHasta(e.target.value)} style={{ padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.8rem', background: 'white', outline: 'none' }} />
                <button
                  onClick={() => { setMermasFechaDesde(inputFechaDesde); setMermasFechaHasta(inputFechaHasta); }}
                  style={{ background: 'var(--primary-main)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Filtrar
                </button>
                {(mermasFechaDesde || mermasFechaHasta || inputFechaDesde || inputFechaHasta) && (
                  <button onClick={() => { setInputFechaDesde(''); setInputFechaHasta(''); setMermasFechaDesde(''); setMermasFechaHasta(''); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: '0 4px' }}>Limpiar</button>
                )}
              </div>
            )}

            <div className="filter-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
              TIPO STOCK:
              <select
                value={selectedTipoStock}
                onChange={(e) => setSelectedTipoStock(e.target.value)}
                className="filter-select"
                style={{ padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--app-bg)', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}
              >
                <option value="TODOS">Todos</option>
                <option value="L.UTILIZACION">Libre Utilización</option>
                <option value="C.CALIDAD">Control Calidad</option>
                <option value="BLOQUEADO">Bloqueado</option>
              </select>
            </div>

            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 8px' }}></div>
            <button
              onClick={fetchAdjustments}
              className="btn"
              title="Recargar datos"
              style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-main)' }}
            >
              <RefreshCw size={14} /> Refrescar
            </button>

          </div>
        </div>

        {/* TABLA PRINCIPAL DE MOVIMIENTOS E INVENTARIO CON COLUMNAS SEPARADAS */}
        <div className="data-table-container" style={{ width: '100%', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>FOLIO</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>OPERACIÓN SAP</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>ESTADO SAP</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>REF. SAP</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>C.MATERIAL</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>LOTE SAP</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>ORIGEN / DESTINO</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>TIPO STOCK</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>CANTIDAD</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>CENTRO</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>FECHA</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={12} style={{ textAlign: 'center', padding: '2rem' }}>Cargando movimientos e información desde la BD...</td></tr>
              ) : filteredAdjustments.length === 0 ? (
                <tr><td colSpan={12} style={{ textAlign: 'center', padding: '2rem' }}>No se encontraron registros en esta vista con los filtros seleccionados.</td></tr>
              ) : (
                filteredAdjustments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((header) => (
                  <React.Fragment key={header.ID}>
                    {header.detalles.map((det, j) => {
                      const rowKey = `${header.ID}-${j}`;

                      let estadoSapBadge = { label: 'Pendiente', bg: '#fef3c7', color: '#b45309', border: '#fde68a' };
                      const estadoUpper = (header.Estado_SAP || '').toUpperCase();
                      if (estadoUpper === 'PROCESADO' || estadoUpper === 'EXITOSO' || estadoUpper === 'COMPLETADO') {
                        estadoSapBadge = { label: 'Sincronizado', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' };
                      } else if (estadoUpper.includes('ERROR') || estadoUpper.includes('FALLO')) {
                        estadoSapBadge = { label: 'Fallo SAP', bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
                      }

                      const movBadge = getMovimientoTypeBadge(det.Tipo_Movimiento, det.Almacen_Origen, det.Almacen_Destino);

                      return (
                        <tr
                          key={rowKey}
                          style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'var(--app-bg)'}
                          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                          onClick={() => { setSelectedAjuste({ header, detalle: det }); }}
                        >
                          <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>
                            {header.Nro_Ajuste}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '12px', background: movBadge.bg, color: movBadge.color, border: `1px solid ${movBadge.border}`, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              {movBadge.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 8px', borderRadius: '12px', background: estadoSapBadge.bg, color: estadoSapBadge.color, border: `1px solid ${estadoSapBadge.border}` }}>
                              {estadoSapBadge.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'left' }}>
                            {header.Documento_SAP_Ref ? (
                              <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-main)', background: 'var(--app-bg)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                                {header.Documento_SAP_Ref}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pendiente</span>
                            )}
                          </td>

                          {/* CÓDIGO MATERIAL (ZCEN) INDEPENDIENTE */}
                          <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: 'var(--text-main)' }}>
                            {det.Codigo_Material}
                          </td>

                          {/* LOTE SAP INDEPENDIENTE */}
                          <td style={{ padding: '12px 16px', textAlign: 'left' }}>
                            <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-secondary)', background: '#f8fafc', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                              {det.Lote_SAP || 'N/A'}
                            </span>
                          </td>

                          {/* ALMACÉN ORIGEN / DESTINO CON DISEÑO LIMPIO */}
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#f0f9ff', padding: '6px 12px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>Alm {det.Almacen_Origen || det.Almacen_Destino || 'N/A'}</span>
                              </div>
                              <ArrowRight size={14} style={{ color: '#0284c7', margin: '0 2px' }} />
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>Alm {det.Almacen_Destino || det.Almacen_Origen || 'N/A'}</span>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            {(() => {
                              const detAny = det as any;
                              let tipoStock = String(detAny.TipoStockDestino || detAny.tipo_stock_destino || detAny.tipostockdestino || '').toUpperCase();
                              
                              // Asignación inteligente en base al tipo de movimiento si viene vacío
                              if (!tipoStock) {
                                if (det.Tipo_Movimiento === '555') tipoStock = 'BLOQUEADO';
                                else if (['553', '331', '333'].includes(det.Tipo_Movimiento)) tipoStock = 'CALIDAD';
                              }

                              let stockLabel = 'L.UTILIZACION';
                              let stockColor = '#15803d'; // green
                              let stockBg = '#dcfce7';

                              if (tipoStock === 'BLOQUEADO') {
                                stockLabel = 'BLOQUEADO';
                                stockColor = '#b91c1c'; // red
                                stockBg = '#fee2e2';
                              } else if (tipoStock === 'CALIDAD') {
                                stockLabel = 'C.CALIDAD';
                                stockColor = '#b45309'; // orange
                                stockBg = '#fef3c7';
                              }

                              return (
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: stockColor, background: stockBg, padding: '3px 8px', borderRadius: '12px', border: `1px solid ${stockColor}40`, whiteSpace: 'nowrap' }}>
                                  {stockLabel}
                                </span>
                              );
                            })()}
                          </td>

                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            {(() => {
                              const esEgreso = ['711', '717', '551', '553', '555', '331', '333'].includes(det.Tipo_Movimiento);
                              const cantidadReal = esEgreso ? -Math.abs(det.Cantidad) : det.Cantidad;
                              return (
                                <span style={{ 
                                  fontWeight: 600, 
                                  color: cantidadReal > 0 ? 'var(--success-text)' : (cantidadReal < 0 ? 'var(--danger-text)' : 'inherit') 
                                }}>
                                  {cantidadReal > 0 ? '+' + cantidadReal : cantidadReal} Un.
                                </span>
                              );
                            })()}
                          </td>

                          <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600 }}>
                            {header.Centro || '1000'}
                          </td>

                          <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <span>{new Date(String(header.Fecha_Creacion).replace('Z', '')).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(String(header.Fecha_Creacion).replace('Z', '')).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: 'white' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Mostrando resultados {filteredAdjustments.length === 0 ? 0 : Math.min((currentPage - 1) * itemsPerPage + 1, filteredAdjustments.length)} al {Math.min(currentPage * itemsPerPage, filteredAdjustments.length)} de un total de {filteredAdjustments.length} movimientos
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', background: currentPage === 1 ? '#f8fafc' : 'white', color: currentPage === 1 ? '#94a3b8' : 'var(--text-main)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={16} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>
                Página {currentPage} de {Math.max(1, Math.ceil(filteredAdjustments.length / itemsPerPage))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredAdjustments.length / itemsPerPage), p + 1))}
                disabled={currentPage >= Math.ceil(filteredAdjustments.length / itemsPerPage)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', background: currentPage >= Math.ceil(filteredAdjustments.length / itemsPerPage) ? '#f8fafc' : 'white', color: currentPage >= Math.ceil(filteredAdjustments.length / itemsPerPage) ? '#94a3b8' : 'var(--text-main)', cursor: currentPage >= Math.ceil(filteredAdjustments.length / itemsPerPage) ? 'not-allowed' : 'pointer' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* MODAL DETALLE DE MOVIMIENTO EXTRACTADO */}
        {selectedAjuste && (
          <MovementDetailModal
            header={selectedAjuste.header}
            detalle={selectedAjuste.detalle}
            onClose={() => setSelectedAjuste(null)}
          />
        )}

      </main>

      {/* MODAL DE MOTIVO DE MERMA */}
      {motivoModal && (
        <div onClick={() => setMotivoModal(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(2px)' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'white', borderRadius: '8px', width: '90%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--app-bg)' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                <FileText size={18} color="var(--primary-main)" />
                Motivo de la Pérdida
              </h3>
              <button onClick={() => setMotivoModal(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-main)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '24px 20px', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {motivoModal}
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'var(--app-bg)' }}>
              <button onClick={() => setMotivoModal(null)} className="btn btn-primary" style={{ padding: '8px 24px' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Inventory;
