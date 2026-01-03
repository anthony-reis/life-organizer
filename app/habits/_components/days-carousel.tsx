// app/habits/_components/days-carousel.tsx
"use client";

import { useEffect, useRef, useState } from "react";

interface DaysCarouselProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function DaysCarousel({
  selectedDate,
  onDateChange,
}: DaysCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visibleMonth, setVisibleMonth] = useState(selectedDate.getMonth());
  const [visibleYear, setVisibleYear] = useState(selectedDate.getFullYear());
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0, moved: false });
  const hasInitializedRef = useRef(false);

  // Gerar 90 dias (30 antes, hoje, 60 depois)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = -30; i <= 60; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(date);
  }

  // Função para centralizar um dia - MELHORADA
  const centerDate = (targetDate: Date, smooth = false) => {
    if (!scrollRef.current) {
      return;
    }

    const targetDateStr = targetDate.toDateString();
    const targetIndex = days.findIndex(
      (d) => d.toDateString() === targetDateStr
    );

    const container = scrollRef.current;

    const dayElement = container.children[targetIndex] as HTMLElement;

    // Esperar o layout estar pronto
    requestAnimationFrame(() => {
      const containerWidth = container.clientWidth;
      const elementWidth = dayElement.offsetWidth;
      const gap = 12; // 3 * 4px (gap-3)

      // Calcular posição considerando o gap
      const elementPosition = targetIndex * (elementWidth + gap);
      const scrollPosition =
        elementPosition - containerWidth / 2 + elementWidth / 2;

      if (smooth) {
        container.scrollTo({
          left: Math.max(0, scrollPosition),
          behavior: "smooth",
        });
      } else {
        container.scrollLeft = Math.max(0, scrollPosition);
      }
    });
  };

  // Inicializar scroll no primeiro render
  useEffect(() => {
    if (!hasInitializedRef.current && scrollRef.current) {
      // Esperar tudo renderizar
      const timer = setTimeout(() => {
        centerDate(today, false);
        hasInitializedRef.current = true;
      }, 150);

      return () => clearTimeout(timer);
    }
  }, []);

  // Detectar o mês visível ao fazer scroll
  const handleScroll = () => {
    if (!scrollRef.current || isDragging) return;

    const container = scrollRef.current;
    const scrollCenter = container.scrollLeft + container.offsetWidth / 2;

    for (let i = 0; i < days.length; i++) {
      const element = container.children[i] as HTMLElement;
      if (!element) continue;

      const elementCenter = element.offsetLeft + element.offsetWidth / 2;

      if (Math.abs(elementCenter - scrollCenter) < element.offsetWidth) {
        const centerDate = days[i];
        if (
          centerDate.getMonth() !== visibleMonth ||
          centerDate.getFullYear() !== visibleYear
        ) {
          setVisibleMonth(centerDate.getMonth());
          setVisibleYear(centerDate.getFullYear());
        }
        break;
      }
    }
  };

  // Mouse/Touch handlers
  const handleDragStart = (clientX: number) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: clientX,
      scrollLeft: scrollRef.current.scrollLeft,
      moved: false,
    };
    scrollRef.current.style.cursor = "grabbing";
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging || !scrollRef.current) return;

    const deltaX = clientX - dragStartRef.current.x;

    if (Math.abs(deltaX) > 5) {
      dragStartRef.current.moved = true;
    }

    scrollRef.current.scrollLeft = dragStartRef.current.scrollLeft - deltaX;
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
    }
  };

  const handleDateClick = (date: Date) => {
    if (!dragStartRef.current.moved) {
      onDateChange(date);
      setTimeout(() => centerDate(date, true), 50);
    }
    dragStartRef.current.moved = false;
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const goToToday = () => {
    onDateChange(today);
    setTimeout(() => centerDate(today, true), 50);
  };

  const isTodaySelected = isToday(selectedDate);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-semibold text-foreground">
          {MESES[visibleMonth]} {visibleYear}
        </h2>
        {!isTodaySelected && (
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            Hoje
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={(e) => handleDragStart(e.pageX)}
        onMouseMove={(e) => handleDragMove(e.pageX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
        className="flex gap-3 overflow-x-scroll pb-2 px-2 scrollbar-hide cursor-grab select-none"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {days.map((date, index) => {
          const todayCheck = isToday(date);
          const selected = isSelected(date);

          return (
            <button
              key={`day-${index}`}
              onClick={() => handleDateClick(date)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-2xl transition-all ${
                selected
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : todayCheck
                  ? "bg-primary/10 text-primary border-2 border-primary/20"
                  : "bg-card text-card-foreground hover:bg-accent"
              }`}
            >
              <span
                className={`text-[10px] font-medium mb-0.5 ${
                  selected
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground"
                }`}
              >
                {DIAS_SEMANA[date.getDay()]}
              </span>
              <span className="text-xl font-bold">{date.getDate()}</span>
              {todayCheck && !selected && (
                <div className="w-1 h-1 bg-primary rounded-full mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
