import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  MapPin, 
  Layers,
  Calendar,
  Building2,
  FileText,
  PackageCheck,
  Check,
  Send
} from 'lucide-react';
import { OutboundDelivery, OutboundItem, OutboundService } from '../../services/outbound.service';

interface PickingDetailModalProps {
  deliveryId: number | string;
  onClose: () => void;
  onDispatched?: () => void;
}

export const PickingDetailModal: React.FC<PickingDetailModalProps> = ({
  deliveryId,
  onClose,
  onDispatched
}) => {
  const [delivery, setDelivery] = useState<(OutboundDelivery & { lineas: OutboundItem[] }) | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [dispatching, setDispatching] = useState<boolean>(false);

  useEffect(() => {
    loadDelivery();
  }, [deliveryId]);

  // Cerrar modal al presionar la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const loadDelivery = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await OutboundService.getDeliveryById(deliveryId);
      setDelivery(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar entrega');
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchSap = async () => {
    if (!delivery) return;
    setDispatching(true);
    setError(null);
    setSuccessBanner(null);
    try {
      const res = await OutboundService.dispatchToSap(delivery.IdEntrega);
      setSuccessBanner(`¡Salida de mercancías contabilizada exitosamente en SAP! Documento PGI: ${res.documentoPgi}. Guía DTE: ${res.folioDte}`);
      await loadDelivery();
      if (onDispatched) {
        onDispatched();
      }
    } catch (err: any) {
      setError(err.message || 'Error al comunicar con la API de SAP para contabilizar la salida.');
    } finally {
      setDispatching(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.split(' ')[0];
    const parts = cleanDate.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}-${month}-${year}`;
    }
    const d = new Date(dateStr);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}-${month}-${year}`;
  };

  const isConfirmed = delivery?.Estado === 'PICKING_CONFIRMADO' || delivery?.Estado === 'DESPACHADO' || delivery?.Estado === 'DTE_EMITIDO';
  const isDespachado = delivery?.Estado === 'DESPACHADO';

  const totalSolicitado = delivery?.lineas?.reduce((acc, l) => acc + Number(l.Cantidad_Solicitada || 0), 0) || 0;
  const totalPickeado = delivery?.lineas?.reduce((acc, l) => acc + Number(l.Cantidad_Pickeada || 0), 0) || 0;

  return (
    // OVERLAY: Fondo atenuado sólido limpio (SIN backdrop-blur)
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <PackageCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Entrega de Salida #{delivery?.Numero_Entrega_SAP || '...'}
                </h3>
                {isDespachado && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    PGI 601 SAP CONCLUIDO
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-medium">
                <span>Pedido Venta: <strong className="font-mono text-slate-700">{delivery?.Pedido_Venta_SAP || '-'}</strong></span>
                {delivery?.Destinatario && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600 truncate max-w-[420px]">{delivery.Destinatario}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            title="Cerrar modal (Esc)"
          >
            <X size={19} />
          </button>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="p-6 overflow-y-auto space-y-5">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-xs font-bold tracking-wider uppercase text-slate-600">
                CARGANDO DETALLE DE EXPEDICIÓN...
              </span>
            </div>
          ) : !delivery ? (
            <div className="py-20 text-center text-slate-400">
              No se pudo encontrar la entrega solicitada.
            </div>
          ) : (
            <>
              {/* STEPPER LOGÍSTICO SAP */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>FLUJO OFICIAL DE INTERFAZ CENABAST ⟷ OPERADOR LOGÍSTICO</span>
                  <span className="text-blue-600 font-semibold">ESTÁNDAR LOGÍSTICO SAP</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {/* PASO 1 */}
                  <div className="flex flex-col items-center text-center p-2.5 rounded-lg bg-white border border-emerald-200 shadow-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mb-1">
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 uppercase">1. PEDIDO VENTA</span>
                    <span className="text-[9px] text-slate-400 font-mono">SAP VA01</span>
                  </div>

                  {/* PASO 2 */}
                  <div className="flex flex-col items-center text-center p-2.5 rounded-lg bg-white border border-emerald-200 shadow-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mb-1">
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 uppercase">2. ENTREGA SALIDA</span>
                    <span className="text-[9px] text-slate-400 font-mono">SAP VL01N</span>
                  </div>

                  {/* PASO 3 */}
                  <div className={`flex flex-col items-center text-center p-2.5 rounded-lg bg-white border shadow-xs ${
                    isConfirmed ? 'border-emerald-200' : 'border-blue-400 ring-2 ring-blue-500/10'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                      isConfirmed ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white animate-pulse'
                    }`}>
                      {isConfirmed ? <Check size={13} strokeWidth={3} /> : '3'}
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 uppercase">3. PICKEO BODEGA</span>
                    <span className="text-[9px] text-blue-600 font-semibold">ROL OL (FÍSICO)</span>
                  </div>

                  {/* PASO 4 */}
                  <div className={`flex flex-col items-center text-center p-2.5 rounded-lg bg-white border shadow-xs ${
                    delivery.Folio_DTE ? 'border-emerald-200' : 'border-slate-200 opacity-70'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                      delivery.Folio_DTE ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {delivery.Folio_DTE ? <Check size={13} strokeWidth={3} /> : '4'}
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 uppercase">4. EMISIÓN DTE 52</span>
                    <span className="text-[9px] text-slate-400 font-mono">GUÍA SII CENABAST</span>
                  </div>

                  {/* PASO 5 */}
                  <div className={`flex flex-col items-center text-center p-2.5 rounded-lg bg-white border shadow-xs col-span-2 sm:col-span-1 ${
                    isDespachado ? 'border-emerald-300 ring-2 ring-emerald-500/20' : 'border-slate-200 opacity-60'
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                      isDespachado ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isDespachado ? <Check size={13} strokeWidth={3} /> : '5'}
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 uppercase">5. SALIDA SAP (601)</span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {delivery.Documento_SAP_PGI || 'PGI AUTOMÁTICO'}
                    </span>
                  </div>
                </div>
              </div>

              {/* GRID DE DATOS CLAVE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                {/* DESTINATARIO */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <Building2 size={12} className="text-slate-400" />
                    <span>DESTINATARIO MERCANCÍA</span>
                  </div>
                  <div className="font-bold text-slate-800 uppercase text-xs line-clamp-1" title={delivery.Destinatario}>
                    {delivery.Destinatario}
                  </div>
                  <div className="text-[11px] text-slate-500 uppercase mt-1 flex items-center gap-1">
                    <MapPin size={11} className="text-slate-400 shrink-0" />
                    <span className="truncate">{delivery.Direccion_Destino}, {delivery.Comuna}</span>
                  </div>
                </div>

                {/* FECHAS */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <Calendar size={12} className="text-slate-400" />
                    <span>COMPROMISO DESPACHO</span>
                  </div>
                  <div className="font-bold text-slate-800 text-xs font-mono">
                    {formatDate(delivery.Fecha_Compromiso)}
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase mt-1 block">
                    CREADO: {formatDate(delivery.Fecha_Creacion)}
                  </span>
                </div>

                {/* ESTADO */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <PackageCheck size={12} className="text-slate-400" />
                    <span>ESTADO EXPEDICIÓN</span>
                  </div>
                  <div className="font-bold text-xs uppercase">
                    {delivery.Estado === 'PENDIENTE_PICKING' && (
                      <span className="text-amber-700">PENDIENTE DE PICKEO</span>
                    )}
                    {delivery.Estado === 'EN_PICKING' && (
                      <span className="text-sky-700">EN PICKING</span>
                    )}
                    {delivery.Estado === 'PICKING_CONFIRMADO' && (
                      <span className="text-purple-700">PICKING CONFIRMADO</span>
                    )}
                    {delivery.Estado === 'DESPACHADO' && (
                      <span className="text-emerald-700">DESPACHADO CONFORME</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase mt-1 block truncate">
                    OPERADOR: {delivery.Usuario_OL || 'WMS_OPERADOR_LOGISTICO'}
                  </span>
                </div>

                {/* GUÍA DTE */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <FileText size={12} className="text-slate-400" />
                    <span>GUÍA DESPACHO (DTE 52)</span>
                  </div>
                  <div className="font-bold text-xs font-mono text-emerald-700">
                    {delivery.Folio_DTE || 'EN ESPERA DE PICKEO'}
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase mt-1 block">
                    {delivery.Documento_SAP_PGI ? `PGI: ${delivery.Documento_SAP_PGI}` : 'DOCUMENTO SII ELECTRÓNICO'}
                  </span>
                </div>
              </div>

              {/* BANNERS DE MENSAJE */}
              {successBanner && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  <span className="font-medium">{successBanner}</span>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* TABLA DE PRODUCTOS A PICKEAR */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers size={15} className="text-blue-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      LISTA DE PICKING DE MEDICAMENTOS
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {delivery.lineas.length} {delivery.lineas.length === 1 ? 'LÍNEA' : 'LÍNEAS'}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      TOTAL: {totalPickeado} / {totalSolicitado}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-2.5 px-3 text-center">POS</th>
                        <th className="py-2.5 px-3">CÓDIGO MATERIAL</th>
                        <th className="py-2.5 px-4">DESCRIPCIÓN DEL MEDICAMENTO</th>
                        <th className="py-2.5 px-3 text-center">CANT. SOLICITADA</th>
                        <th className="py-2.5 px-3 text-center">CANT. PICKEADA</th>
                        <th className="py-2.5 px-3 text-center">LOTE FÍSICO (SAP)</th>
                        <th className="py-2.5 px-3 text-center">ESTADO ÍTEM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {delivery.lineas.map((linea) => {
                        const completado = Number(linea.Cantidad_Pickeada) >= Number(linea.Cantidad_Solicitada) && Number(linea.Cantidad_Solicitada) > 0;
                        return (
                          <tr key={linea.IdDetalle} className="hover:bg-slate-50/60 transition-colors">
                            {/* POS */}
                            <td className="py-3 px-3 text-center font-mono text-slate-400 text-[11px]">
                              {linea.Posicion}
                            </td>

                            {/* CÓDIGO */}
                            <td className="py-3 px-3 font-mono font-bold text-slate-800">
                              {linea.Codigo_Material}
                            </td>

                            {/* DESCRIPCIÓN */}
                            <td className="py-3 px-4 font-semibold text-slate-800 uppercase">
                              {linea.Descripcion_Material}
                            </td>

                            {/* CANT. SOLICITADA */}
                            <td className="py-3 px-3 text-center font-mono font-bold text-slate-800 whitespace-nowrap">
                              {linea.Cantidad_Solicitada} {linea.Unidad_Medida}
                            </td>

                            {/* CANT. PICKEADA */}
                            <td className="py-3 px-3 text-center whitespace-nowrap">
                              <span className={`font-mono font-bold ${
                                completado
                                  ? 'text-emerald-600'
                                  : Number(linea.Cantidad_Pickeada) > 0
                                  ? 'text-sky-600'
                                  : 'text-slate-400'
                              }`}>
                                {linea.Cantidad_Pickeada} {linea.Unidad_Medida}
                              </span>
                            </td>

                            {/* LOTE FÍSICO */}
                            <td className="py-3 px-3 text-center whitespace-nowrap">
                              {linea.Lote_SAP ? (
                                <span className="inline-flex items-center font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                  {linea.Lote_SAP}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic text-[11px] font-mono">
                                  SIN ASIGNAR
                                </span>
                              )}
                            </td>

                            {/* ESTADO */}
                            <td className="py-3 px-3 text-center whitespace-nowrap">
                              {linea.Estado_Item === 'PICKEADO' || completado || isConfirmed ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wide">
                                  <CheckCircle2 size={11} />
                                  PICKEADO OL
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 uppercase tracking-wide">
                                  <Clock size={11} />
                                  PENDIENTE OL
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors uppercase tracking-wider cursor-pointer shadow-xs"
          >
            CERRAR
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            {isDespachado ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/90 px-3.5 py-1.5 rounded-xl border border-emerald-300 shadow-xs">
                  <CheckCircle2 size={15} />
                  DESPACHADO Y CONTABILIZADO EN SAP ({delivery?.Documento_SAP_PGI || 'PGI CONCLUIDO'})
                </span>
                <button
                  onClick={() => alert(`Imprimiendo Guía DTE 52 (${delivery?.Folio_DTE || 'N/A'}) para entrega SAP ${delivery?.Numero_Entrega_SAP}...`)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all uppercase tracking-wider cursor-pointer"
                >
                  <Printer size={14} />
                  DTE 52
                </button>
              </div>
            ) : isConfirmed ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
                  <PackageCheck size={14} />
                  PICKEO 100% ({delivery?.Usuario_OL || 'WMS_OL'})
                </span>
                <button
                  onClick={handleDispatchSap}
                  disabled={dispatching}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-xl shadow-xs transition-all uppercase tracking-wider cursor-pointer"
                  title="Contabiliza la salida de mercancías (PGI Movimiento 601) en SAP de inmediato"
                >
                  <Send size={14} className={dispatching ? 'animate-spin' : ''} />
                  {dispatching ? 'CONTABILIZANDO EN SAP...' : 'CONTABILIZAR EN SAP (PGI 601)'}
                </button>
                <button
                  onClick={() => alert(`Imprimiendo Guía DTE 52 (${delivery?.Folio_DTE || 'N/A'}) para entrega SAP ${delivery?.Numero_Entrega_SAP}...`)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all uppercase tracking-wider cursor-pointer"
                >
                  <Printer size={14} />
                  DTE 52
                </button>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-lg border border-amber-200">
                <Clock size={14} />
                ESPERANDO CONFIRMACIÓN DE PICKEO POR EL OPERADOR LOGÍSTICO
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
