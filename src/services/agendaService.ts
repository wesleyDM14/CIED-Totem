import axios from "axios";
import type { Schedule } from "../contexts/interfaces";

export const getAgendamentoDiario = async (date: Date, setAgendamentoDiario: (agendaDiaria: Schedule) => void) => {
    const formattedDate = date.toISOString().split('T')[0];
    try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/agendamento/totem`, {
            params: {
                date: formattedDate,
            },
            headers: {
                "x-api-key": import.meta.env.VITE_APP_SECRET_KEY,
            },
        });

        setAgendamentoDiario(response.data);
    } catch (error) {
        console.error("Erro ao buscar agendamento diário: ", error);
    }
};