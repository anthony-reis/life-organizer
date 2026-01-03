"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AddBookModal from "./add-book-modal";

export default function AddBookButton({
  semanasOcupadas,
}: {
  semanasOcupadas: number[];
}) {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalAberto(true)}
        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold hover:from-cyan-600 hover:to-cyan-700 shadow-md hover:shadow-lg transition-all"
      >
        <Plus className="w-5 h-5" />
        Adicionar Livro
      </button>

      {modalAberto && (
        <AddBookModal
          semanasOcupadas={semanasOcupadas}
          onClose={() => setModalAberto(false)}
        />
      )}
    </>
  );
}
