// src/components/ModalConfirmacionObjeto.tsx
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface Props {
  mensaje: string;
  onConfirm: () => void;
  onCancel: () => void;
  show: boolean;
}

export default function ModalConfirmacionObjeto({ mensaje, onConfirm, onCancel, show }: Props) {
  return (
    <Transition show={show} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onCancel}
      >
        {/* Contenedor para centrar el panel */}
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
              {/* Panel del modal */}
              <Dialog.Panel className="inline-block w-full max-w-md p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl border border-gray-200">
                <div className="text-center">
                  {/* Ícono de advertencia */}
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                    <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  
                  <Dialog.Title className="text-2xl font-bold text-gray-800 mb-2">
                    ¿Confirmar eliminación?
                  </Dialog.Title>
                  <p className="text-gray-600 mb-6">
                    {mensaje}
                  </p>
                  
                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      className="px-6 py-3 bg-gray-300 text-gray-800 rounded-xl hover:bg-gray-400 transition-all duration-300 font-semibold shadow-lg"
                      onClick={onCancel}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 font-semibold shadow-lg"
                      onClick={onConfirm}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}