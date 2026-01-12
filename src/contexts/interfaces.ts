// ================= ENUMS =================
export type TicketType = "NORMAL" | "PREFERENCIAL" | "IDOSO_80_MAIS" | "AGENDAMENTO";
export type TicketStatus = "WAITING" | "CALLED" | "FINISHED" | "CANCELED";

// ================= ENTIDADES BÁSICAS =================

export interface Professional {
    id: string;
    name: string;
}

export interface Procedimento {
    id: string;
    name: string;
    description?: string | null; // O Prisma pode retornar null se não tiver descrição

    // Campos auxiliares para o Frontend (Preenchidos no .map do Totem)
    nomeProfissional?: string;
    dailyScheduleId?: string;
}

// ================= AGENDA (SCHEDULE) =================

// Representa a tabela intermediária (ScheduleProcedimento)
// É isso que vem dentro do array 'procedimentos' da agenda
export interface ScheduleProcedimentoItem {
    id: string;
    dailyScheduleId: string;
    procedimentoId: string;

    // O Backend manda o objeto procedimento completo
    procedimento: Procedimento;

    // O Backend manda a lista de profissionais vinculados
    profissionais: Professional[];
}

// Representa o objeto principal da Agenda do Dia
export interface Schedule {
    id: string;
    date: string; // Vem como String ISO do JSON (ex: "2023-10-25T00:00:00.000Z")
    procedimentos: ScheduleProcedimentoItem[];
}

// ================= TICKETS (SENHAS) =================

export interface Ticket {
    id: string;
    code: string;
    type: TicketType;
    status: TicketStatus;

    corredor: string | null; // Pode ser null se ainda não foi chamado

    createdAt: string; // ISO String
    calledAt?: string | null;
    finishedAt?: string | null;
    scheduleAt?: string | null;

    procedimentoId: string;
    procedimento?: Procedimento;
}