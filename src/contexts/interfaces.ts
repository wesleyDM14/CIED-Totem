
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
    type: "NORMAL" | "PREFERENCIAL";
    status: "WAITING" | "CALLED" | "FINISHED";
    serviceCounter: string;
    createdAt: Date;
    calledAt?: Date;
    scheduleAt?: Date;
    procedimentoId: string;
    updatedAt?: Date;
    procedimento?: Procedimento
}