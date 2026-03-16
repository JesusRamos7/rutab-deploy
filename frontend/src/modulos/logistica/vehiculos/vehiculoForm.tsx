import React, { useState, useEffect } from 'react';
import { Vehiculo } from './types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehiculo?: Vehiculo | null; // Si viene, es edición. Si no, es creación.
}

export const VehiculoForm = ({ isOpen, onClose, onSuccess, vehiculo }: Props) => {
  const [formData, setFormData] = useState({
    placas: '',
    marca: '',
    modelo: '',
    rendimiento_combustible: '',
    estatus: 'disponible'
  });

  useEffect(() => {
    if (vehiculo) {
      setFormData({
        placas: vehiculo.placas,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        rendimiento_combustible: vehiculo.rendimiento_combustible.toString(),
        estatus: vehiculo.estatus
      });
    } else {
      setFormData({ placas: '', marca: '', modelo: '', rendimiento_combustible: '', estatus: 'disponible' });
    }
  }, [vehiculo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = vehiculo 
      ? `http://localhost:3000/vehiculos/${vehiculo.id}` 
      : 'http://localhost:3000/vehiculos';
    
    const method = vehiculo ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        rendimiento_combustible: parseFloat(formData.rendimiento_combustible)
      }),
    });

    if (res.ok) {
      onSuccess();
      onClose();
    } else {
      const error = await res.json();
      alert(error.message || "Error al guardar");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            {vehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Placas (AAA-000-A)</label>
            <input 
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.placas}
              onChange={e => setFormData({...formData, placas: e.target.value})}
              placeholder="TAB-123-A"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Marca</label>
              <input 
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.marca}
                onChange={e => setFormData({...formData, marca: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Modelo</label>
              <input 
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.modelo}
                onChange={e => setFormData({...formData, modelo: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Estatus</label>
            <select 
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.estatus}
              onChange={e => setFormData({...formData, estatus: e.target.value})}
            >
              <option value="disponible">Disponible / Activo</option>
              <option value="mantenimiento">En Mantenimiento</option>
              <option value="fuera_servicio">Fuera de Servicio</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-500 font-medium hover:bg-slate-50 rounded-xl transition-colors">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
              Guardar Unidad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};