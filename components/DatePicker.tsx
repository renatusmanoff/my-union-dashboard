'use client';

import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Выберите дату",
  className = ""
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(
    value ? new Date(value) : new Date()
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setCurrentMonth(date);
    } else {
      setSelectedDate(undefined);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    onChange(date ? format(date, 'yyyy-MM-dd') : '');
    setIsOpen(false);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    const newDate = new Date(currentMonth);
    newDate.setFullYear(newYear);
    setCurrentMonth(newDate);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    const newDate = new Date(currentMonth);
    newDate.setMonth(newMonth);
    setCurrentMonth(newDate);
  };

  const displayValue = selectedDate ? format(selectedDate, 'dd.MM.yyyy') : placeholder;

  // Генерируем список годов (от 1924 до текущего года + 10)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1923 + 10 }, (_, i) => currentYear + 10 - i);

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
      >
        <span className={selectedDate ? 'text-white' : 'text-gray-400'}>
          {displayValue}
        </span>
        <CalendarIcon className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg p-4">
          {/* Навигация с выбором месяца и года */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => {
                const newDate = new Date(currentMonth);
                newDate.setMonth(newDate.getMonth() - 1);
                setCurrentMonth(newDate);
              }}
              className="p-1 hover:bg-gray-700 rounded-md transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-300" />
            </button>

            <div className="flex items-center gap-2">
              <select
                value={currentMonth.getMonth()}
                onChange={handleMonthChange}
                className="bg-gray-700 text-white border border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={currentMonth.getFullYear()}
                onChange={handleYearChange}
                className="bg-gray-700 text-white border border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                const newDate = new Date(currentMonth);
                newDate.setMonth(newDate.getMonth() + 1);
                setCurrentMonth(newDate);
              }}
              className="p-1 hover:bg-gray-700 rounded-md transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-300" />
            </button>
          </div>

          {/* Календарь */}
          <style jsx global>{`
            .custom-datepicker .rdp {
              --rdp-cell-size: 36px;
              --rdp-accent-color: #3b82f6;
              --rdp-background-color: transparent;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            .custom-datepicker .rdp-months {
              justify-content: center;
              margin: 0 !important;
            }
            
            .custom-datepicker .rdp-month {
              width: 100%;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            .custom-datepicker .rdp-table {
              width: 100%;
              max-width: 100%;
            }
            
            .custom-datepicker .rdp-head_cell {
              color: #9ca3af;
              font-weight: 400;
              font-size: 0.75rem;
              text-transform: uppercase;
              padding: 0.25rem;
            }
            
            .custom-datepicker .rdp-cell {
              padding: 0;
            }
            
            .custom-datepicker .rdp-day {
              color: #fff;
              border-radius: 0.375rem;
              transition: all 0.2s;
              width: 36px;
              height: 36px;
            }
            
            .custom-datepicker .rdp-day:hover:not(.rdp-day_disabled):not(.rdp-day_selected) {
              background-color: #374151;
            }
            
            .custom-datepicker .rdp-day_selected {
              background-color: #3b82f6 !important;
              color: white !important;
              font-weight: 600;
            }
            
            .custom-datepicker .rdp-day_today:not(.rdp-day_selected) {
              background-color: #374151;
              font-weight: 600;
            }
            
            .custom-datepicker .rdp-day_outside {
              color: #6b7280;
              opacity: 0.5;
            }
            
            .custom-datepicker .rdp-day_disabled {
              color: #6b7280;
              opacity: 0.5;
              cursor: not-allowed;
            }
            
            .custom-datepicker .rdp-caption {
              display: none !important;
              height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              visibility: hidden !important;
              position: absolute !important;
            }
            
            .custom-datepicker .rdp-nav,
            .custom-datepicker .rdp-caption_label,
            .custom-datepicker .rdp-caption_dropdowns {
              display: none !important;
              height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          `}</style>
          
          <div className="custom-datepicker">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              locale={ru}
            />
          </div>
        </div>
      )}
    </div>
  );
}
