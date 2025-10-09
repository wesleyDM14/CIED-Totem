
export interface Procedimento {
    id: string;
    nomeProfissional: string;
    description: string;
}

export interface ScheduleProcedimento {
    id: string;
    procedimento: Procedimento;
}

export interface Schedule {
    id: string;
    date: Date;
    procedimentos: ScheduleProcedimento[];
}

export interface Ticket {
    id: string;
    code: string;
    type: "NORMAL" | "PREFERENCIAL" | "IDOSO_80_MAIS";
    status: "WAITING" | "CALLED" | "FINISHED";
    corredor: string;
    createdAt: Date;
    calledAt?: Date;
    scheduleAt?: Date;
    procedimentoId: string;
    updatedAt?: Date;
    procedimento?: Procedimento
}