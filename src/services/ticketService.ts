import axios, { AxiosError } from "axios";
import type { Ticket } from "../contexts/interfaces";

// Cria o ticket no Banco de Dados (API Nuvem)
export const createTicket = async (tipo: 'NORMAL' | 'PREFERENCIAL' | 'IDOSO_80_MAIS', procedimentoId: string): Promise<Ticket> => {
    try {
        // CORREÇÃO: /api/tickets/totem (Rota unificada no ticketRoute.ts)
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/tickets/totem`, {
            type: tipo,
            procedimentoId
        }, {
            headers: {
                "Content-Type": "application/json",
                // Autenticação via API Key
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

// Envia para o Servidor de Impressão Local (Node.js rodando no Totem)
export const imprimirLocal = async (dados: {
    code: string;
    type: string;
    procedimento: string;
    profissional: string;
    createdAt: string | Date;
}) => {
    try {
        // Chama localhost:3333/print (Servidor USB Local)
        await fetch("http://localhost:3333/print", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dados),
        });
    } catch (error) {
        console.error("Erro ao enviar para impressão local:", error);
        alert("Erro de comunicação com a impressora.");
    }
};