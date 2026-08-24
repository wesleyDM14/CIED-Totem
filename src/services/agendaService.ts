import axios from "axios";
// Certifique-se de ter a interface Schedule definida em contexts/interfaces
import type { Schedule } from "../contexts/interfaces";

export const getAgendamentoDiario = async (date: Date, setAgendamentoDiario: (agendaDiaria: Schedule) => void) => {
    // Ancora em MEIO-DIA UTC (não meia-noite): meia-noite UTC já é 21h do dia
    // anterior em Brasília, e o backend normaliza a data recebida para "o
    // dia de Brasília em que esse instante cai" — enviar meia-noite fazia
    // essa conta voltar um dia inteiro durante o expediente todo. Mesmo
    // padrão já usado no painel administrativo de Agenda por este motivo.
    const formattedDate = date.toISOString().split('T')[0] + 'T12:00:00.000Z';

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