import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { Calendar, Clock } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
}

export function DateTimePicker({ value, onChange, mode = 'datetime' }: DateTimePickerProps) {
  const { t, language } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(value);

  // Generate dates for the next 30 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Generate hours (0-23)
  const generateHours = () => Array.from({ length: 24 }, (_, i) => i);

  // Generate minutes (0, 5, 10, ..., 55)
  const generateMinutes = () => Array.from({ length: 12 }, (_, i) => i * 5);

  const dates = generateDates();
  const hours = generateHours();
  const minutes = generateMinutes();

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return t('datePicker.today');
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return t('datePicker.tomorrow');
    }
    
    const day = date.getDate();
    const month = language === 'ru' ? 
      ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'][date.getMonth()] :
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
    const weekday = language === 'ru' ?
      ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'][date.getDay()] :
      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    
    return `${weekday}, ${day} ${month}`;
  };

  const handleDateChange = (dateIndex: number, hour?: number, minute?: number) => {
    const newDate = new Date(dates[dateIndex]);
    newDate.setHours(hour ?? selectedDate.getHours());
    newDate.setMinutes(minute ?? selectedDate.getMinutes());
    setSelectedDate(newDate);
    onChange(newDate);
  };

  const handleHourChange = (hour: number) => {
    const newDate = new Date(selectedDate);
    newDate.setHours(hour);
    setSelectedDate(newDate);
    onChange(newDate);
  };

  const handleMinuteChange = (minute: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMinutes(minute);
    setSelectedDate(newDate);
    onChange(newDate);
  };

  const showDate = mode === 'date' || mode === 'datetime';
  const showTime = mode === 'time' || mode === 'datetime';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-center gap-4">
        {showDate && (
          <div className="flex items-center gap-2 text-[#4A9FD8]">
            <Calendar className="h-5 w-5" />
            <span className="font-medium">{t('datePicker.selectDate')}</span>
          </div>
        )}
        {showDate && showTime && (
          <div className="h-4 w-px bg-border" />
        )}
        {showTime && (
          <div className="flex items-center gap-2 text-[#52C9C1]">
            <Clock className="h-5 w-5" />
            <span className="font-medium">{t('datePicker.selectTime')}</span>
          </div>
        )}
      </div>

      {/* Picker Wheels */}
      <div className="relative flex items-center justify-center gap-2">
        {/* Date Wheel */}
        {showDate && (
          <WheelPicker
            items={dates.map((date, index) => ({ value: index, label: formatDate(date) }))}
            selectedValue={dates.findIndex(d => d.toDateString() === selectedDate.toDateString())}
            onChange={(index) => handleDateChange(index)}
            accentColor="#4A9FD8"
          />
        )}

        {/* Hour Wheel */}
        {showTime && (
          <>
            <WheelPicker
              items={hours.map(h => ({ value: h, label: h.toString().padStart(2, '0') }))}
              selectedValue={selectedDate.getHours()}
              onChange={handleHourChange}
              accentColor="#52C9C1"
            />
            <span className="text-2xl font-medium text-muted-foreground">:</span>
            
            {/* Minute Wheel */}
            <WheelPicker
              items={minutes.map(m => ({ value: m, label: m.toString().padStart(2, '0') }))}
              selectedValue={Math.round(selectedDate.getMinutes() / 5) * 5}
              onChange={handleMinuteChange}
              accentColor="#52C9C1"
            />
          </>
        )}
      </div>

      {/* Selection Indicator */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-12 w-full rounded-lg border-2 border-[#4A9FD8]/20 bg-[#4A9FD8]/5" />
      </div>
    </div>
  );
}

interface WheelPickerProps {
  items: { value: number; label: string }[];
  selectedValue: number;
  onChange: (value: number) => void;
  accentColor?: string;
}

function WheelPicker({ items, selectedValue, onChange, accentColor = '#4A9FD8' }: WheelPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const y = useMotionValue(0);
  const ITEM_HEIGHT = 48;

  const selectedIndex = items.findIndex(item => item.value === selectedValue);

  useEffect(() => {
    // Center the selected item
    const targetY = -selectedIndex * ITEM_HEIGHT;
    animate(y, targetY, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    });
  }, [selectedIndex, y]);

  const handleDragEnd = () => {
    setIsDragging(false);
    const currentY = y.get();
    const index = Math.round(-currentY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
    
    onChange(items[clampedIndex].value);
    
    animate(y, -clampedIndex * ITEM_HEIGHT, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    });
  };

  return (
    <div className="relative h-[240px] w-24 overflow-hidden">
      {/* Gradient Overlays */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-background to-transparent" />

      {/* Selection Highlight */}
      <div 
        className="pointer-events-none absolute inset-x-0 z-0 h-12 rounded-lg"
        style={{
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: `${accentColor}10`,
          borderTop: `2px solid ${accentColor}20`,
          borderBottom: `2px solid ${accentColor}20`,
        }}
      />

      {/* Wheel Items */}
      <motion.div
        ref={containerRef}
        drag="y"
        dragConstraints={{ top: -(items.length - 1) * ITEM_HEIGHT, bottom: 0 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="absolute inset-x-0 top-1/2 cursor-grab active:cursor-grabbing"
      >
        {items.map((item, index) => {
          const itemY = useTransform(
            y,
            (latest) => {
              const offset = index * ITEM_HEIGHT + latest;
              const centerOffset = Math.abs(offset);
              return centerOffset;
            }
          );

          const opacity = useTransform(itemY, [0, ITEM_HEIGHT * 2], [1, 0.3]);
          const scale = useTransform(itemY, [0, ITEM_HEIGHT * 2], [1, 0.8]);

          return (
            <motion.div
              key={item.value}
              style={{
                opacity,
                scale,
                height: ITEM_HEIGHT,
              }}
              className="flex items-center justify-center"
            >
              <span
                className="select-none text-center transition-colors"
                style={{
                  fontSize: '18px',
                  fontWeight: index === selectedIndex ? 600 : 400,
                  color: index === selectedIndex ? accentColor : 'var(--muted-foreground)',
                }}
              >
                {item.label}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
