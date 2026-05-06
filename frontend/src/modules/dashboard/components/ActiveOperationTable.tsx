// src/modules/dashboard/components/ActiveOperationTable.tsx
import React from 'react';
import { ActiveOperation } from '../types';
import { MapPin, Navigation, User } from 'lucide-react';

export const ActiveOperationTable: React.FC<{ operations: ActiveOperation[] }> = ({ operations }) => {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-md border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Operación Activa</h2>
        <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
          {operations.length} Unidades en Calle
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Unidad / Chofer</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Ruta Activa</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Progreso</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Estatus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {operations.map((op) => (
              <tr key={op.id_ruta} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-bold text-slate-800 text-base">
                      <Navigation size={14} className="text-blue-500" />
                      {op.unidad}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <User size={14} />
                      {op.chofer}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-300" />
                    {op.ruta_nombre}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-2 w-32">
                    <div className="flex justify-between text-[10px] font-black text-slate-400">
                      <span>{op.progreso}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-1000" 
                        style={{ width: `${op.progreso}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
                    op.estatus === 'en_movimiento' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-red-50 text-red-600 border-red-100 animate-pulse'
                  }`}>
                    {op.estatus === 'en_movimiento' ? 'Moviéndose' : 'Incidencia'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};