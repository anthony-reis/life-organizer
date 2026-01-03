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
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Gerar 90 dias (30 antes, hoje, 60 depois)
  const getDaysArray = () => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = -30; i <= 60; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const days = getDaysArray();

  useEffect(() => {
    // Scroll para o dia selecionado ao montar
    if (scrollRef.current) {
      const selectedIndex = days.findIndex(
        (d) => d.toDateString() === selectedDate.toDateString()
      );
      if (selectedIndex >= 0) {
        const dayElement = scrollRef.current.children[
          selectedIndex
        ] as HTMLElement;
        if (dayElement) {
          scrollRef.current.scrollTo({
            left:
              dayElement.offsetLeft -
              scrollRef.current.offsetWidth / 2 +
              dayElement.offsetWidth / 2,
            behavior: "smooth",
          });
        }
      }
    }
  }, []);

  // Detectar o mês visível ao fazer scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const scrollCenter = container.scrollLeft + container.offsetWidth / 2;

    // Encontrar o elemento no centro da tela
    for (let i = 0; i < days.length; i++) {
      const element = container.children[i] as HTMLElement;
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

  // Drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = "grabbing";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiplicar para scroll mais rápido
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
    }
  };

  // Touch events para mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="space-y-4">
      {/* Header com mês */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-semibold text-foreground">
          {MESES[visibleMonth]} {visibleYear}
        </h2>
      </div>

      {/* Carrossel horizontal */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        className="flex gap-3 overflow-x-scroll pb-2 px-2 scrollbar-hide scroll-smooth cursor-grab select-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {days.map((date, index) => {
          const today = isToday(date);
          const selected = isSelected(date);

          return (
            <button
              key={index}
              onClick={() => !isDragging && onDateChange(date)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-2xl transition-all ${
                selected
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : today
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
              {today && !selected && (
                <div className="w-1 h-1 bg-primary rounded-full mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
