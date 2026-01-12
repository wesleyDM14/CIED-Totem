import axios from "axios";
// Certifique-se de ter a interface Schedule definida em contexts/interfaces
import type { Schedule } from "../contexts/interfaces";

export const getAgendamentoDiario = async (date: Date, setAgendamentoDiario: (agendaDiaria: Schedule) => void) => {
    // Formata a data para YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];

    try {
        // CORREÇÃO: /api/agendamentos/totem (Plural, conforme definido no index.ts do back)
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/agendamentos/totem`, {
            params: {
                date: formattedDate,
            },
            headers: {
                // Envia a chave secreta
                "x-api-key": import.meta.env.VITE_APP_SECRET_KEY,
            },
        });

        setAgendamentoDiario(response.data);
    } catch (error) {
        console.error("Erro ao buscar agendamento diário: ", error);
    }
};