// src/modules/management/evidences/pages/EvidencesPage.tsx
import { useState } from "react";
import { useEvidences } from "../hooks/useEvidences";
import { EvidenceFiltersBar } from "../components/EvidenceFiltersBar";
import { EvidenceTable } from "../components/EvidenceTable";
import { EvidenceReviewModal } from "../components/EvidenceReviewModal";
import { Evidence } from "../types/evidence.types";

export const EvidencesPage = () => {
  const { evidences, isLoading, filters, updateFilters, handleApprove } =
    useEvidences();
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(
    null,
  );

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">
          Gestión de Evidencias
        </h1>
        <p className="text-gray-500">
          Supervisa y valida las entregas realizadas por los choferes.
        </p>
      </header>

      <EvidenceFiltersBar filters={filters} onFilterChange={updateFilters} />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
          <div className="size-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-medium">Cargando registros de auditoría...</p>
        </div>
      ) : (
        <EvidenceTable
          evidences={evidences}
          onReview={(ev) => setSelectedEvidence(ev)}
        />
      )}

      <EvidenceReviewModal
        evidence={selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
        onApprove={handleApprove}
      />
    </div>
  );
};
