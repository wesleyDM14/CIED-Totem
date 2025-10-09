import axios, { AxiosError } from "axios";
import type { Ticket } from "../contexts/interfaces";

export const createTicket = async (tipo: 'NORMAL' | 'PREFERENCIAL' | 'IDOSO_80_MAIS', procedimentoId: string): Promise<Ticket> => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/tickets/create`, {
            type: tipo,
            procedimentoId
        }, {
            headers: {
                "Content-Type": "application/json",
                "x-api-key": import.meta.env.VITE_APP_SECRET_KEY,
            }
        });

        return response.data as Ticket;
    } catch (err) {
        const error = err as AxiosError<{ error: string }>;
        console.error(error.response?.data?.error || error.message);
        throw error;
    }
}

export const imprimirLocal = async (dados: {
    code: string;
    type: string;
    procedimento: string;
    profissional: string;
    createdAt: Date;
}) => {
    try {
        await fetch("http://localhost:3333/print", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dados),
        });
    } catch (error) {
        console.error("Erro ao enviar para impressão local:", error);
    }
};
