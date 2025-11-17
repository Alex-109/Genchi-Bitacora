import React, { useState, useEffect } from 'react';
import { objetosVariosApi } from '../services/objetosVarios';
import type { ObjetoVario, CrearObjetoVarioRequest } from '../types/objetosVarios';

interface Props {
  objeto?: ObjetoVario | null;
  onClose: () => void;
  onSuccess: () => void;
  onAgregarAlCarrito?: (objeto: ObjetoVario) => void;
  estaEnCarrito?: boolean;
}

const ModalObjetoVario: React.FC<Props> = ({ 
  objeto, 
  onClose, 
  onSuccess, 
  onAgregarAlCarrito,
  estaEnCarrito = false 
}) => {
  const [formData, setFormData] = useState<CrearObjetoVarioRequest>({
    nombre: '',
    unidad: '',
    comentarios: '',
  });
  const [loading, setLoading] = useState(false);

  const isEditing = !!objeto;

  useEffect(() => {
    if (objeto) {
      setFormData({
        nombre: objeto.nombre,
        unidad: objeto.unidad,
        comentarios: objeto.comentarios || '',
      });
    }
  }, [objeto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.unidad.trim()) {
      alert('Nombre y unidad son campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      if (isEditing && objeto) {
        await objetosVariosApi.actualizar(objeto.id, formData);
      } else {
        await objetosVariosApi.crear(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error guardando objeto:', error);
      alert('Error al guardar el objeto');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAgregarAlCarrito = () => {
    if (!formData.nombre.trim() || !formData.unidad.trim()) {
      alert('Nombre y unidad son campos obligatorios para agregar al carrito');
      return;
    }

    if (onAgregarAlCarrito) {
      const objetoParaCarrito: ObjetoVario = {
        id: objeto?.id || Date.now(), // ID temporal si es nuevo
        nombre: formData.nombre,
        unidad: formData.unidad,
        comentarios: formData.comentarios,
        createdAt: objeto?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onAgregarAlCarrito(objetoParaCarrito);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {isEditing ? 'Editar Objeto' : 'Nuevo Objeto'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej: Router WiFi, Switch, Proyector..."
              />
            </div>

            {/* Unidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidad *
              </label>
              <input
                type="text"
                name="unidad"
                value={formData.unidad}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej: Valparaíso, Viña del Mar..."
              />
            </div>

            {/* Comentarios */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comentarios
              </label>
              <textarea
                name="comentarios"
                value={formData.comentarios}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Observaciones o detalles adicionales..."
              />
            </div>

            {/* Botones */}
            <div className="flex flex-col gap-3 pt-4">
              {/* Botón Agregar al Carrito - Solo si no está editando y tiene la función */}
              {onAgregarAlCarrito && !isEditing && (
                <button
                  type="button"
                  onClick={handleAgregarAlCarrito}
                  disabled={estaEnCarrito || loading}
                  className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                    estaEnCarrito
                      ? 'bg-green-600 text-white cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {estaEnCarrito ? '✓ Agregado al Carrito' : '+ Agregar al Carrito'}
                </button>
              )}

              {/* Botones principales en fila */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalObjetoVario;