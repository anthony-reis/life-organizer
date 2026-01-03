"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateHabitModal from "./create-habit-modal";

export default function CreateHabitButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto"
        size="lg"
      >
        <Plus className="w-5 h-5 mr-2" />
        Criar Novo Hábito
      </Button>

      {isOpen && <CreateHabitModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
