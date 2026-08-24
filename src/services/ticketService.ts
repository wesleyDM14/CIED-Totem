import axios, { AxiosError } from "axios";
import type { Ticket } from "../contexts/interfaces";

export const createTicket = async (tipo: 'NORMAL' | 'PREFERENCIAL' | 'IDOSO_80_MAIS', procedimentoId: string): Promise<Ticket> => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/tickets/totem`, {
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
        const response = await fetch("http://localhost:3333/print", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dados),
        });

        // fetch só rejeita a Promise em falha de rede — uma resposta HTTP de
        // erro (impressora offline, serviço local fora do ar respondendo
        // 5xx) chega aqui como "sucesso". Sem checar `response.ok`, uma
        // falha de impressão passava despercebida.
        if (!response.ok) {
            throw new Error(`Serviço de impressão local respondeu com status ${response.status}`);
        }
    } catch (error) {
        // Antes o erro só ia pro console e o paciente nunca via o código da
        // senha gerada quando a impressora falhava. Relançar aqui permite
        // que a tela mostre o código como fallback visual.
        console.error("Erro ao enviar para impressão local:", error);
        throw error;
    }
};
