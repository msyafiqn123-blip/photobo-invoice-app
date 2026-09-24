import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { formatDateIndo } from '../utils/formatters';

const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const DAY_NAMES_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const CalendarPicker = ({
  value,
  onChange,
  label = 'Tanggal',
  placeholder = 'Pilih tanggal...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse currently selected date or fallback to today
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const initialView = selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : new Date();

  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth()); // 0-11

  // Keep view in sync when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (year, month, day) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateString = `${year}-${mm}-${dd}`;
    onChange(dateString);
    setIsOpen(false);
  };

  const handleSetToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    setViewYear(y);
    setViewMonth(m);
    handleSelectDay(y, m, d);
  };

  const handleSetTomorrow = () => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    setViewYear(y);
    setViewMonth(m);
    handleSelectDay(y, m, d);
  };

  // Generate calendar days
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      month: viewMonth === 0 ? 11 : viewMonth - 1,
      year: viewMonth === 0 ? viewYear - 1 : viewYear,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    calendarDays.push({
      day: d,
      month: viewMonth,
      year: viewYear,
      isCurrentMonth: true,
    });
  }

  // Next month leading days to complete 35 or 42 cells grid
  const remainingCells = 42 - calendarDays.length;
  const nextMonthLimit = remainingCells >= 7 ? remainingCells - 7 : remainingCells;
  for (let d = 1; d <= nextMonthLimit; d++) {
    calendarDays.push({
      day: d,
      month: viewMonth === 11 ? 0 : viewMonth + 1,
      year: viewMonth === 11 ? viewYear + 1 : viewYear,
      isCurrentMonth: false,
    });
  }

  // Helper to check if a day is today
  const today = new Date();
  const isToday = (y, m, d) =>
    today.getFullYear() === y && today.getMonth() === m && today.getDate() === d;

  // Helper to check if a day is selected
  const isSelected = (y, m, d) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === y &&
      selectedDate.getMonth() === m &&
      selectedDate.getDate() === d
    );
  };

  const getDayOfWeekName = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return '';
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[d.getDay()];
  };

  const dayOfWeek = getDayOfWeekName(value);

  // Year range options (2024 - 2030)
  const years = Array.from({ length: 7 }, (_, i) => 2024 + i);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Interactive Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full bg-stone-950 border border-stone-800 hover:border-amber-500/60 rounded-xl px-3 py-2 text-left text-xs sm:text-sm text-stone-200 flex items-center justify-between gap-2 transition group shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition shrink-0">
            <CalendarIcon className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            {value ? (
              <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                <span className="font-bold text-stone-100 text-xs sm:text-sm whitespace-nowrap">
                  {formatDateIndo(value)}
                </span>
                {dayOfWeek && (
                  <span className="text-[10px] bg-stone-800 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-stone-700 shrink-0">
                    {dayOfWeek}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-stone-500 italic text-xs whitespace-nowrap">{placeholder}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pl-1">
          <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded font-bold group-hover:bg-amber-900/60 transition">
            PILIH
          </span>
        </div>
      </button>

      {/* Calendar Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 w-72 sm:w-80 bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl p-4 animate-fadeIn">
          {/* Calendar Header: Month & Year Selector */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-800">
            <div className="flex items-center gap-1">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="bg-stone-950 border border-stone-800 text-stone-100 font-bold text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {MONTH_NAMES_ID.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="bg-stone-950 border border-stone-800 text-amber-400 font-mono font-bold text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-stone-200 transition"
                title="Bulan sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-stone-200 transition"
                title="Bulan berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {DAY_NAMES_ID.map((dayName, idx) => (
              <span
                key={dayName}
                className={`text-[10px] font-bold py-1 ${
                  idx === 0 ? 'text-rose-400' : 'text-stone-400'
                }`}
              >
                {dayName}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, idx) => {
              const active = isSelected(cell.year, cell.month, cell.day);
              const currentDay = isToday(cell.year, cell.month, cell.day);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(cell.year, cell.month, cell.day)}
                  className={`h-8 sm:h-9 rounded-xl text-xs font-semibold flex items-center justify-center relative transition transform active:scale-95 ${
                    active
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/40 z-10'
                      : cell.isCurrentMonth
                      ? 'text-stone-200 hover:bg-stone-800 hover:text-amber-300'
                      : 'text-stone-600 hover:bg-stone-800/50 hover:text-stone-400'
                  } ${
                    currentDay && !active
                      ? 'border border-amber-500/50 text-amber-400 font-bold'
                      : ''
                  }`}
                >
                  <span>{cell.day}</span>
                  {currentDay && !active && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-400"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Shortcuts */}
          <div className="mt-3 pt-2.5 border-t border-stone-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleSetToday}
                className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 rounded-lg text-[11px] font-medium transition"
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={handleSetTomorrow}
                className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 rounded-lg text-[11px] font-medium transition"
              >
                Besok
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-stone-400 hover:text-stone-200 px-2 py-1 rounded-lg hover:bg-stone-800 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPicker;
