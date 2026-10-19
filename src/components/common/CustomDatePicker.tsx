import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // Formato YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEK_DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Seleccionar fecha...',
  label,
  minDate: _minDate,
  maxDate: _maxDate,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parsear fecha actual seleccionada o usar la de hoy para la vista inicial
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const initialDate = selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : new Date();

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0 - 11

  // Sincronizar vista si cambia el valor externamente
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Manejar clic fuera para cerrar el popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (year: number, month: number, day: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSetToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  // Formato visual legible para el trigger
  const formatDisplay = (val: string) => {
    if (!val) return '';
    const parts = val.split('-');
    if (parts.length !== 3) return val;
    const [y, m, d] = parts;
    const monthIndex = parseInt(m, 10) - 1;
    const shortMonth = MONTH_NAMES[monthIndex]?.slice(0, 3).toLowerCase() || m;
    return `${d} ${shortMonth} ${y}`;
  };

  // Generar matriz de días para el mes actual
  const getDaysGrid = () => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

    // Ajuste para que lunes sea 0 y domingo 6 (en JS domingo es 0)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonth = lastDayOfMonth.getDate();
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();

    const days = [];

    // Días del mes anterior
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        month: viewMonth === 0 ? 11 : viewMonth - 1,
        year: viewMonth === 0 ? viewYear - 1 : viewYear,
        isCurrentMonth: false
      });
    }

    // Días del mes actual
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true
      });
    }

    // Días del mes siguiente para completar cuadrícula de 35 o 42 celdas
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        day: d,
        month: viewMonth === 11 ? 0 : viewMonth + 1,
        year: viewMonth === 11 ? viewYear + 1 : viewYear,
        isCurrentMonth: false
      });
    }

    return days;
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
          <CalendarIcon size={12} className="text-slate-400" />
          {label}
        </label>
      )}

      {/* Input Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-white border rounded-lg font-mono text-xs transition-all shadow-sm text-left ${
          isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
        }`}
      >
        <span className={`truncate ${value ? 'text-slate-800 font-semibold' : 'text-slate-400 font-sans'}`}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-slate-100 transition-colors"
              title="Borrar fecha"
            >
              <X size={13} />
            </span>
          )}
          <CalendarIcon size={14} className="text-slate-400" />
        </div>
      </button>

      {/* Popover Calendario */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 left-0 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-3.5 animate-in fade-in zoom-in-95 duration-150">
          {/* Header de navegación mes y año */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="text-xs font-bold text-slate-800 tracking-wide capitalize">
              {MONTH_NAMES[viewMonth]} <span className="font-mono text-blue-600">{viewYear}</span>
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEK_DAYS.map((wd) => (
              <div key={wd} className="text-center text-[10px] font-bold uppercase text-slate-400 py-1">
                {wd}
              </div>
            ))}
          </div>

          {/* Cuadrícula de días */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysGrid().map((cell, idx) => {
              const cellDateStr = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
              const isSelected = value === cellDateStr;
              const isToday = todayStr === cellDateStr;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(cell.year, cell.month, cell.day)}
                  className={`h-8 w-full flex items-center justify-center text-xs rounded-lg font-mono transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20 scale-105 z-10'
                      : cell.isCurrentMonth
                      ? isToday
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 hover:bg-blue-100'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
                      : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Footer con atajos */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-500 hover:text-rose-600 font-medium px-2 py-1 rounded-md hover:bg-rose-50 transition-colors"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleSetToday}
              className="text-blue-600 hover:text-blue-700 font-bold px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
