import React, { useState } from "react";
import { useOrderPage } from "./hooks/useOrdersPage";
import { OrdersForm } from "./OrdersForm";
import { Order } from "./types";

export const OrdersPage: React.FC = () => {
  // Agregamos fetchOrders a la extracción de datos del hook
const { orders, isLoading, fetchOrders } = useOrderPage();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };
  

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header del Panel */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Pedidos</h1>
          <p className="text-slate-500">Administra todos los pedidos y entregas</p>
        </div>
        {/* En este módulo, según pediste, no hay botón de "Nuevo Pedido" visible o funcional */}
      </div>

      {/* Cards de Resumen (Similares a tu mockup) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center text-xl">🕒</div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{orders.filter(o => o.estado_pedido === 'pendiente').length}</p>
            <p className="text-xs font-bold text-slate-400 uppercase">Pendientes</p>
          </div>
        </div>
        {/* ... repetir para En Tránsito y Completados */}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">ID Pedido</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Prioridad</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                  {/* ID Generado tipo PED-001 */}
                  <td className="px-6 py-4 font-bold text-blue-600">
                    {order.id_generado}
                  </td>

                  {/* Nombre del Cliente (Desde la relación) */}
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-700">
                      {order.clientes?.nombre || "Sin cliente"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {order.clientes?.direccion || "Sin dirección"}
                    </div>
                  </td>

                  {/* Estado con tus estilos de RuTAB */}
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${order.estado_pedido === 'completado' ? 'bg-green-100 text-green-600' :
                        order.estado_pedido === 'en transito' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                      {order.estado_pedido}
                    </span>
                  </td>

                  {/* Prioridad Simulada */}
                  <td className="px-6 py-4">
                    <span className={`font-bold ${order.prioridad === 'Alta' ? 'text-red-500' :
                        order.prioridad === 'Media' ? 'text-orange-500' : 'text-green-500'
                      }`}>
                      {order.prioridad}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(order)}
                      className="bg-slate-100 hover:bg-blue-600 hover:text-white p-2 rounded-lg transition-all"
                    >
                      ⚙️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulario/Modal de Edición */}
      <OrdersForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchOrders();
        }}
        order={selectedOrder}
      />
    </div>
  );
};