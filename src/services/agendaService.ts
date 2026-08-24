import axios from "axios";
// Certifique-se de ter a interface Schedule definida em contexts/interfaces
import type { Schedule } from "../contexts/interfaces";

export const getAgendamentoDiario = async (date: Date, setAgendamentoDiario: (agendaDiaria: Schedule) => void) => {
    // Formata a data para YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];

    try {
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
        // Antes o erro só ia pro console e quem chamava nunca ficava sabendo
        // que a busca falhou — a tela ficava com a grade vazia para sempre,
        // sem nenhuma tentativa de retry. Relançar aqui permite que a página
        // trate o erro (mostrar aviso, agendar nova tentativa).
        console.error("Erro ao buscar agendamento diário: ", error);
        throw error;
    }
};