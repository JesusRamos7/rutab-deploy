import { Download, RefreshCcw, Undo2, Redo2, FileWarning } from "lucide-react";
import { useFailedDeliveries } from "../hooks/useFailedDeliveries";
import { FailedDeliveriesTable } from "../components/FailedDeliveriesTable";

export const FailedDeliveriesPage = () => {
  const {
    orders,
    isLoading,
    removeOrder,
    exportToCSV,
    fetchOrders,
    undo,
    redo,
    canUndo,
    canRedo,
    isExporting,
  } = useFailedDeliveries();

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-full">
      {/* Encabezado Principal */}
      <header className="mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="flex gap-4 items-start">
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl shrink-0 mt-1 shadow-sm border border-red-100">
            <FileWarning className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Extracción de Pedidos Fallidos
            </h1>
            <p className="text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
              Visualiza, depura y exporta la lista de entregas fallidas. Utiliza
              los filtros por columna para buscar elementos específicos antes de
              generar tu reporte CSV.
            </p>
          </div>
        </div>

        {/* Panel de Controles (Acciones alineadas horizontalmente) */}
        <div className="flex flex-row items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200/60 shadow-sm shrink-0">
          {/* Botones de Historial */}
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2.5 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all focus:outline-none focus:ring-2 focus:ring-slate-200"
            title="Deshacer (Recuperar elemento retirado)"
          >
            <Undo2 className="w-5 h-5" />
          </button>

          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2.5 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all focus:outline-none focus:ring-2 focus:ring-slate-200"
            title="Rehacer"
          >
            <Redo2 className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-slate-200 mx-1" />

          {/* Botón Sincronizar (Solo icono) */}
          <button
            onClick={fetchOrders}
            disabled={isLoading}
            className="p-2.5 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:hover:bg-transparent transition-all focus:outline-none focus:ring-2 focus:ring-blue-100"
            title="Sincronizar base de datos"
          >
            <RefreshCcw
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>

          <div className="w-px h-6 bg-slate-200 mx-1" />

          {/* Botón Generar CSV */}
          <button
            onClick={exportToCSV}
            disabled={isLoading || isExporting || orders.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 ml-1 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 disabled:opacity-50 disabled:bg-slate-400 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-slate-900/50"
          >
            {isExporting ? (
              <RefreshCcw className="w-[18px] h-[18px] animate-spin" />
            ) : (
              <Download className="w-[18px] h-[18px]" />
            )}
            <span className="hidden sm:inline">
              {isExporting ? "Procesando..." : "Generar CSV"}
            </span>
            <span className="sm:hidden">CSV</span>
          </button>
        </div>
      </header>

      {/* Área de Contenido Principal */}
      <section>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl border border-slate-200/60 shadow-sm gap-5">
            <div className="relative flex justify-center items-center">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="size-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin relative z-10" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-800 text-lg">
                Consultando base de datos...
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Obteniendo registros de entregas fallidas
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 bg-white px-4 py-1.5 rounded-full border border-slate-200/60 shadow-sm">
                Total para exportar:{" "}
                <strong className="text-blue-600 ml-1">{orders.length}</strong>
              </span>
            </div>
            <FailedDeliveriesTable orders={orders} onRemove={removeOrder} />
          </div>
        )}
      </section>
    </div>
  );
};
