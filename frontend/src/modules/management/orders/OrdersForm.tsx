import React, { useState } from "react";
import { OrderProps } from "./types";
import { useOrderForm } from "./hooks/useOrdersForm";

export const OrdersForm: React.FC<OrderProps> = ({
  isOpen,
  onClose,
  onSuccess,
  order,
}) => {
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const { formData, isLoading, handleChange, handleSubmit, handleCancelOrder } = useOrderForm(
    order,
    isOpen,
    onSuccess,
    onClose
  );

  if (!isOpen) return null;

  // Modal de advertencia para "Eliminar" (Cancelar)
  if (showCancelAlert) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            ⚠️
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">¿Cancelar Pedido?</h3>
          <p className="text-slate-500 mb-6">
            Esta acción marcará el pedido como <b>cancelado</b>. El pedido dejará de ser visible en el panel principal.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCancelAlert(false)}
              className="flex-1 py-2.5 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors"
            >
              Volver
            </button>
            <button
              onClick={handleCancelOrder}
              className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all"
            >
              Sí, Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Encabezado */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Gestionar Pedido</h2>
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">{order?.id_generado}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cliente (Lectura)</label>
            <input
              disabled
              className="w-full border border-slate-100 bg-slate-50 rounded-xl px-4 py-2.5 text-slate-500"
              value={order?.clientes?.nombre || ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Estado de Entrega</label>
              <select
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.estado_pedido}
                onChange={(e) => handleChange("estado_pedido", e.target.value)}
                disabled={isLoading}
              >
                <option value="pendiente">Pendiente</option>
                <option value="en transito">En tránsito</option>
                <option value="completado">Completado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Prioridad</label>
              <select
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.prioridad}
                onChange={(e) => handleChange("prioridad", e.target.value)}
                disabled={isLoading}
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
          </div>

          {/* Acciones */}
          <div className="pt-4 space-y-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-3 text-slate-500 font-medium hover:bg-slate-50 rounded-xl transition-colors"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex justify-center items-center"
              >
                {isLoading ? "Guardando..." : "Actualizar Pedido"}
              </button>
            </div>
            
            <button
              type="button"
              onClick={() => setShowCancelAlert(true)}
              className="w-full py-3 text-red-500 font-bold border border-red-100 hover:bg-red-50 rounded-xl transition-colors"
            >
              Marcar como Cancelado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};