// src/components/ModalConfirmacion.tsx
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface Props {
  mensaje: string;
  onConfirm: () => void;
  onCancel: () => void;
  show: boolean; // control del modal desde el componente padre
}

export default function ModalConfirmacion({ mensaje, onConfirm, onCancel, show }: Props) {
  return (
    <Transition show={show} as={Fragment}>
      <Dialog
        as="div"
        // 1. Clase 'relative' y 'z-50' aquí en el Dialog principal
        className="relative z-50" 
        onClose={onCancel}
      >
        {/* 2. El fondo (backdrop) va primero y separado */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        {/* 3. Contenedor para centrar el panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* 4. ¡LA CORRECCIÓN CLAVE! Usa <Dialog.Panel> en lugar de <div> */}
              <Dialog.Panel className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title className="text-lg font-medium text-gray-900">
                  {mensaje}
                </Dialog.Title>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                  	onClick={onCancel}
                  >
                  	Cancelar
                  </button>
                  <button
                  	type="button"
                  	className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  	onClick={onConfirm}
                  >
            	     	Eliminar
              	  </button>
              	</div>
        	     </Dialog.Panel> 
          	</Transition.Child>
        	</div>
      	</div>
      </Dialog>
    </Transition>
  );
}