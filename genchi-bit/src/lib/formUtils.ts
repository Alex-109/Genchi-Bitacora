// src/lib/formUtils.ts
import { NewRecordFormState, EquipoDB } from "../types";

export const buildPayload = (formData: NewRecordFormState, direccionId: string): Partial<EquipoDB> => {
    const basePayload: Partial<EquipoDB> = {
        serie: formData.serialNumber,
        modelo: formData.brand === 'Generico' ? "" : formData.model,
        marca: formData.brand,
        direccion: direccionId,
        num_inv: formData.num_inv,
        ip: formData.ip,
        tipo_equipo: formData.tipoEquipo,
        status: "Pendiente",
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        notes: formData.notes,
        nombre_equipo: formData.nombre_equipo,
    };

    if (formData.tipoEquipo === 'PC') {
        return {
            ...basePayload,
            usuario: formData.usuario,
            ver_win: formData.windows || undefined,
            antivirus: formData.antivirus === 'true' ? 'Sí' : 'No',
            cpu: formData.cpu || undefined,
            ram: formData.ram || undefined,
            almacenamiento: formData.almacenamiento || undefined,
            motherboard: formData.motherboard,
            windows: formData.ver_win || undefined,
        };
    }

    if (formData.tipoEquipo === 'Impresora') {
        return {
            ...basePayload,
            drum: formData.drum || undefined,
            toner: formData.toner || undefined,
            conexion: formData.conexion || undefined,
        };
    }

    return basePayload;
};