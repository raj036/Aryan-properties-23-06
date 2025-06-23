import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, setYear, setMonth } from 'date-fns';

const PropertyStatusDropdown = ({ onChange , value}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [selection, setSelection] = useState({
    status: '',
    date: null,
    displayValue: ''
  });
  const [currentViewDate, setCurrentViewDate] = useState(new Date());

  const dropdownRef = useRef(null);
  const yearDropdownRef = useRef(null);
  const monthDropdownRef = useRef(null);

  useEffect(() => {
    if (value) {
      const parts = value.split(" "); // Example: "Reopen Date 10/10/2024"
      const status = parts.slice(0, 2).join(" "); // "Reopen Date"
      const datePart = parts.length > 2 ? parts.slice(2).join(" ") : null;

      setSelection({
        status,
        date: datePart
          ? new Date(datePart.split("/").reverse().join("-"))
          : null,
        displayValue: value,
      });
    }
  }, [value]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }

      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setShowYearDropdown(false);
      }

      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
        setShowMonthDropdown(false);
      }
    };

    if (isOpen || showYearDropdown || showMonthDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, showYearDropdown, showMonthDropdown]);

  // Format and send data to backend as string
  const logFinalSelection = (status, date = null) => {
    let finalValue;
    
    if (date && (status === 'Leased Out' || status === 'Reopen Date')) {
      // Format as single string
      finalValue = `${status} ${format(date, 'dd/MM/yyyy')}`;
    } else {
      // For statuses without dates
      finalValue = status;
    }
    
    // console.log("FINAL USER SELECTION:", finalValue);
    if (onChange) {
      onChange(finalValue);
    }
  };

  const handleStatusSelect = (status) => {
    if (status === 'Leased Out' || status === 'Reopen Date') {
      setSelection({
        ...selection,
        status,
        displayValue: `${status} (Select Date)`
      });
      setShowCalendar(true);
    } else {
      const newSelection = {
        status,
        date: null,
        displayValue: status
      };
      setSelection(newSelection);
      logFinalSelection(status);
      setShowCalendar(false);
    }
    setIsOpen(false);
  };

  const handleDateSelect = (date) => {
    const formattedDate = format(date, 'dd/MM/yyyy');
    const newSelection = {
      ...selection,
      date: date,
      displayValue: `${selection.status} (${formattedDate})`
    };
    
    setSelection(newSelection);
    logFinalSelection(selection.status, date);
    setShowCalendar(false);
  };

  const goToPreviousMonth = () => {
    setCurrentViewDate(subMonths(currentViewDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentViewDate(addMonths(currentViewDate, 1));
  };

  const handleYearSelect = (year) => {
    setCurrentViewDate(setYear(currentViewDate, year));
    setShowYearDropdown(false);
  };

  const handleMonthSelect = (monthIndex) => {
    setCurrentViewDate(setMonth(currentViewDate, monthIndex));
    setShowMonthDropdown(false);
  };

  const SimpleCalendar = () => {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    // Add empty cells for days before the first day of the month
    const emptyCells = Array.from({ length: firstDayOfMonth }, (_, i) => null);
    const allCells = [...emptyCells, ...days];

    // Generate years (current year - 10 to current year + 10)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 200 }, (_, i) => currentYear - 100 + i);

    // Month names
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
      <div className="absolute z-10 p-4 mt-1 bg-white border rounded-md shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={goToPreviousMonth} 
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="flex items-center space-x-1">
            {/* Month dropdown */}
            <div className="relative" ref={monthDropdownRef}>
              <button 
                onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                className="px-1 font-bold rounded hover:bg-gray-100"
              >
                {format(currentViewDate, 'MMMM')}
              </button>
              
              {showMonthDropdown && (
                <div className="absolute left-0 z-20 mt-1 overflow-y-auto bg-white border rounded shadow-lg top-full max-h-48">
                  {months.map((monthName, index) => (
                    <div 
                      key={monthName} 
                      className="p-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleMonthSelect(index)}
                    >
                      {monthName}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Year dropdown */}
            <div className="relative" ref={yearDropdownRef}>
              <button 
                onClick={() => setShowYearDropdown(!showYearDropdown)}
                className="px-1 font-bold rounded hover:bg-gray-100"
              >
                {format(currentViewDate, 'yyyy')}
              </button>
              
              {showYearDropdown && (
                <div className="absolute left-0 z-20 mt-1 overflow-y-auto bg-white border rounded shadow-lg top-full max-h-48">
                  {years.map(year => (
                    <div 
                      key={year} 
                      className="p-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleYearSelect(year)}
                    >
                      {year}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={goToNextMonth} 
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-xs font-semibold text-center">{day}</div>
          ))}
          {allCells.map((day, index) => (
            <div key={index} className="flex items-center justify-center w-8 h-8">
              {day && (
                <button
                  className="flex items-center justify-center w-8 h-8 text-sm rounded-full hover:bg-blue-100"
                  onClick={() => {
                    const selected = new Date(year, month, day);
                    handleDateSelect(selected);
                  }}
                >
                  {day}
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-3">
          <button
            className="px-3 py-1 text-sm text-white bg-blue-500 rounded"
            onClick={() => setShowCalendar(false)}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 text-sm text-white bg-blue-500 rounded"
            onClick={() => setCurrentViewDate(new Date())}
          >
            Today
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <h2 className="mb-2 text-sm font-semibold">Reopen Date</h2>

      <div className="relative">
        <div
          className="h-10 rounded-lg border border-[#D3DAEE] p-3 flex justify-between items-center cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selection.displayValue || "Select Status"}</span>
          <img
            className={`object-none absolute right-[8px] ${isOpen ? "rotate-180" : ""}`}
            src="./LeftColumn/Closed.png"
            alt=""
          />
        </div>

        {isOpen && (
          <div className="absolute left-0 right-0 z-10 mt-1 bg-white border rounded shadow-lg">
            <div className="p-3 cursor-pointer hover:bg-gray-100" onClick={() => handleStatusSelect('Available')}>
              Available
            </div>
            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100" onClick={() => handleStatusSelect('Leased Out')}>
              <span>Leased Out (dd/mm/yyyy)</span>
              <Calendar size={16} />
            </div>
            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100" onClick={() => handleStatusSelect('Reopen Date')}>
              <span>Reopen Date (dd/mm/yyyy)</span>
              <Calendar size={16} />
            </div>
            <div className="p-3 cursor-pointer hover:bg-gray-100" onClick={() => handleStatusSelect('Sold out')}>
              Sold out
            </div>
          </div>
        )}

        {showCalendar && !isOpen && <SimpleCalendar />}
      </div>
    </div>
  );
};

export default PropertyStatusDropdown;