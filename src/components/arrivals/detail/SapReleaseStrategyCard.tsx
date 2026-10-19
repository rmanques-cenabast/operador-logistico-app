import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Lock, Check, Clock, Loader2, ChevronDown, ChevronUp, FileCheck2 } from 'lucide-react';

interface SapReleaseStrategyCardProps {
  poNumber?: string;
  checkingPo: boolean;
  poReleaseInfo: any | null;
  isEsperandoLiberacion: boolean;
  isLiberando: boolean;
  onLiberarClick: () => void;
}

export const SapReleaseStrategyCard: React.FC<SapReleaseStrategyCardProps> = ({
  poNumber,
  checkingPo,
  poReleaseInfo,
  isEsperandoLiberacion,
  isLiberando,
  onLiberarClick
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const isLiberado = poReleaseInfo?.estaLiberado;

  // Obtener nombres de áreas pendientes de aprobación
  const nivelesPendientes = poReleaseInfo?.nivelesLiberacion
    ? poReleaseInfo.nivelesLiberacion.filter((n: any) => !n.aprobado)
    : [];
  const nombresPendientes = nivelesPendientes.map((n: any) => n.descripcion).join(', ');

  return (
    <div className="mb-6 bg-slate-50/80 border border-slate-200 rounded-xl shadow-xs overflow-hidden transition-all duration-200">
      {/* Encabezado Acordeón Clickeable */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3.5 flex items-center justify-between gap-4 text-left hover:bg-slate-100/70 transition-colors cursor-pointer"
        aria-expanded={isExpanded}
      >
        {/* Identificador Pedido de Compra */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
            <FileCheck2 size={18} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-1">
              Estado en SAP ERP
            </span>
            <span className="font-mono font-bold text-sm text-slate-900">
              PC: {poNumber || 'N/D'}
            </span>
          </div>
        </div>

        {/* Texto Informativo Central */}
        <div className="hidden md:flex flex-1 items-center justify-center text-center px-4">
          <p className="text-xs text-slate-600 font-medium truncate">
            {checkingPo
              ? 'Verificando estado de firmas y liberaciones en SAP...'
              : poReleaseInfo
              ? isLiberado
                ? 'El Pedido de Compra se encuentra liberado y autorizado para recepción.'
                : nombresPendientes
                ? `Pendiente de aprobación en SAP por: ${nombresPendientes}.`
                : 'El Pedido de Compra cuenta con aprobaciones pendientes en SAP.'
              : 'Consultando estado del pedido de compra en SAP...'}
          </p>
        </div>

        {/* Badge de Estado y Flecha de Despliegue */}
        <div className="flex items-center gap-3 shrink-0">
          {checkingPo ? (
            <div className="h-6 bg-slate-200/70 rounded-full animate-pulse w-32"></div>
          ) : poReleaseInfo ? (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-normal ${
                isLiberado
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {isLiberado ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Liberado en SAP
                </>
              ) : (
                <>
                  <Lock size={13} className="text-amber-600" />
                  Pendiente de Liberación
                </>
              )}
            </span>
          ) : null}

          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center transition-transform">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* Contenido Desplegable (Detalle de Aprobaciones / Niveles SAP) */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-200/80 bg-white">
          {/* Texto Informativo Centrado */}
          <div className={`py-2.5 text-center ${!isLiberado ? 'border-b border-slate-100 mb-3' : 'mb-2'}`}>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Detalle de Firmas y Aprobaciones del Pedido
            </h5>
            {!isLiberado && (
              <p className="text-xs text-slate-600 font-medium mt-1">
                {nombresPendientes
                  ? `El Pedido de Compra requiere aprobación en SAP por: ${nombresPendientes}.`
                  : (poReleaseInfo?.mensaje || 'El Pedido de Compra requiere que todos los niveles de firma estén aprobados en SAP.')}
              </p>
            )}
          </div>

          {/* Pasos de liberación SAP en formato cuadrícula */}
          {poReleaseInfo?.nivelesLiberacion && poReleaseInfo.nivelesLiberacion.length > 0 ? (
            <div className="mb-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {poReleaseInfo.nivelesLiberacion.map((nivel: any) => (
                  <div
                    key={nivel.codigo}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all shadow-xs"
                  >
                    {/* Icono Redondeado Izquierdo */}
                    <div
                      className={`w-9 h-9 shrink-0 rounded-xl border flex items-center justify-center ${
                        nivel.aprobado
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}
                    >
                      {nivel.aprobado ? (
                        <Check size={18} className="stroke-[2.5]" />
                      ) : (
                        <Clock size={17} className="text-amber-600" />
                      )}
                    </div>

                    {/* Contenido del Nivel */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-mono text-[11px] text-slate-400 font-semibold tracking-wider">
                          Cód: {nivel.codigo}
                        </span>

                        {/* Badge de Estado del Nivel */}
                        {nivel.aprobado ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check size={10} className="stroke-[3]" /> Aprobado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Clock size={10} className="text-amber-600" /> Pendiente
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-xs text-slate-800 truncate" title={nivel.descripcion}>
                        {nivel.descripcion}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-3 text-xs text-slate-500">
              No se encontraron niveles de firma adicionales para este pedido de compra.
            </div>
          )}

          {/* Acción integrada: Liberar a SAP cuando está en espera de liberación */}
          {isEsperandoLiberacion && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center justify-center text-center bg-blue-50/60 rounded-xl p-4 border border-blue-100">
              <div className="mb-3 w-full">
                <strong className="text-blue-900 text-sm block font-bold">
                  Estado: ESPERANDO LIBERACIÓN
                </strong>
                <p className="text-xs text-blue-600 mt-1 w-full">
                  La recepción física fue confirmada en bodega. Al autorizar la liberación, se contabilizará el movimiento de mercaderías en SAP.
                </p>
              </div>
              <button
                onClick={onLiberarClick}
                disabled={isLiberando}
                className={`px-8 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-all shadow-sm inline-flex items-center justify-center gap-2 ${
                  isLiberando
                    ? 'bg-blue-400 text-white cursor-wait opacity-85'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white cursor-pointer hover:shadow'
                }`}
              >
                {isLiberando ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Liberando a SAP...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Liberar a SAP</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

