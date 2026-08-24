import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Modal from "react-modal";
import type { Procedimento, Schedule } from "../../contexts/interfaces";
import { getAgendamentoDiario } from "../../services/agendaService";
import Loading from "../../components/Loading";
import Banner from "../../components/Banner";
import ConnectionIndicator from "../../components/ConnectionIndicator";
import {
    BannerStack,
    ButtonRow,
    Card,
    Container,
    EmptyState,
    FecharButton,
    Grid,
    Logo,
    ModalButton,
    PrintFallbackCard,
    PrintFallbackCode,
    PrintFallbackOverlay,
    Titulo,
} from "./styles";
import logo from '../../assets/CIED.png';
import { FaAccessibleIcon, FaUser } from "react-icons/fa";
import { createTicket, imprimirLocal } from "../../services/ticketService";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BASE_URL);

type TicketType = "NORMAL" | "PREFERENCIAL" | "IDOSO_80_MAIS";

// Retry com backoff simples para a busca da agenda: começa em 15s e cresce
// 5s a cada tentativa até um teto de 30s, enquanto o estado de erro persistir.
const AGENDA_RETRY_BASE_MS = 15_000;
const AGENDA_RETRY_STEP_MS = 5_000;
const AGENDA_RETRY_MAX_MS = 30_000;

// Se a busca da agenda ficar falhando por 5 minutos seguidos, algo está
// estruturalmente errado (backend fora do ar, rede da clínica caiu) e um
// reload completo da página é a ação mais segura num equipamento sem
// supervisão — limpa qualquer estado acumulado e tenta de novo do zero.
const AGENDA_ERROR_WATCHDOG_MS = 5 * 60 * 1000;
const AGENDA_ERROR_WATCHDOG_CHECK_MS = 30_000;

// Tempo que o código da senha fica na tela quando a impressora local falha,
// para a pessoa ter tempo de anotar/ler antes do totem voltar ao normal.
const PRINT_FALLBACK_VISIBLE_MS = 60_000;
const ACTION_ERROR_VISIBLE_MS = 8_000;

type PrintFallbackInfo = {
    code: string;
    type: string;
};

const Totem: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [agendaDiaria, setAgendaDiaria] = useState<Schedule>();
    const [selectedProcedimento, setSelectedProcedimento] = useState<Procedimento | null>(null);

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [creatingTicket, setCreatingTicket] = useState<boolean>(false);

    const [connected, setConnected] = useState<boolean>(true);
    const [agendaError, setAgendaError] = useState<boolean>(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [printFallback, setPrintFallback] = useState<PrintFallbackInfo | null>(null);

    const wasDisconnectedRef = useRef(false);
    const agendaErrorSinceRef = useRef<number | null>(null);
    const agendaRetryCountRef = useRef(0);
    const agendaRetryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedProcedimento(null);
    };

    const fetchAgenda = useCallback(async () => {
        if (agendaRetryTimeoutRef.current) {
            clearTimeout(agendaRetryTimeoutRef.current);
            agendaRetryTimeoutRef.current = null;
        }

        try {
            await getAgendamentoDiario(new Date(), setAgendaDiaria);
            agendaErrorSinceRef.current = null;
            agendaRetryCountRef.current = 0;
            setAgendaError(false);
        } catch (error) {
            console.error(error);
            setAgendaError(true);
            if (agendaErrorSinceRef.current === null) {
                agendaErrorSinceRef.current = Date.now();
            }

            const delay = Math.min(
                AGENDA_RETRY_BASE_MS + agendaRetryCountRef.current * AGENDA_RETRY_STEP_MS,
                AGENDA_RETRY_MAX_MS,
            );
            agendaRetryCountRef.current += 1;
            agendaRetryTimeoutRef.current = setTimeout(() => {
                fetchAgenda();
            }, delay);
        } finally {
            setLoading(false);
        }
    }, []);

    // Busca inicial da agenda ao montar o componente.
    useEffect(() => {
        fetchAgenda();
        return () => {
            if (agendaRetryTimeoutRef.current) {
                clearTimeout(agendaRetryTimeoutRef.current);
            }
        };
    }, [fetchAgenda]);

    // Watchdog: se a agenda ficar em erro por tempo demais, força reload da
    // página inteira em vez de continuar tentando indefinidamente em memória.
    useEffect(() => {
        const interval = setInterval(() => {
            if (agendaErrorSinceRef.current !== null) {
                const elapsed = Date.now() - agendaErrorSinceRef.current;
                if (elapsed >= AGENDA_ERROR_WATCHDOG_MS) {
                    window.location.reload();
                }
            }
        }, AGENDA_ERROR_WATCHDOG_CHECK_MS);

        return () => clearInterval(interval);
    }, []);

    // Conexão do socket.io: mostra indicador de "sem conexão" e refaz a
    // busca da agenda automaticamente ao reconectar, sem depender apenas do
    // evento "agenda-atualizada" vindo do servidor (que não é emitido em
    // reconexão, só quando alguém edita a agenda).
    useEffect(() => {
        const handleAgendaAtualizada = () => {
            fetchAgenda();
        };

        const handleConnect = () => {
            setConnected(true);
            if (wasDisconnectedRef.current) {
                wasDisconnectedRef.current = false;
                fetchAgenda();
            }
        };

        const handleDisconnect = () => {
            setConnected(false);
            wasDisconnectedRef.current = true;
        };

        const handleConnectError = () => {
            setConnected(false);
            wasDisconnectedRef.current = true;
        };

        socket.on("agenda-atualizada", handleAgendaAtualizada);
        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);
        socket.io.on("reconnect", handleConnect);

        return () => {
            socket.off("agenda-atualizada", handleAgendaAtualizada);
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
            socket.io.off("reconnect", handleConnect);
        };
    }, [fetchAgenda]);

    // Some sozinho depois de um tempo, sem exigir clique.
    useEffect(() => {
        if (!actionError) return;
        const timeout = setTimeout(() => setActionError(null), ACTION_ERROR_VISIBLE_MS);
        return () => clearTimeout(timeout);
    }, [actionError]);

    // Mantém o código da senha visível por tempo suficiente para a pessoa
    // anotar, mesmo sem interação.
    useEffect(() => {
        if (!printFallback) return;
        const timeout = setTimeout(() => setPrintFallback(null), PRINT_FALLBACK_VISIBLE_MS);
        return () => clearTimeout(timeout);
    }, [printFallback]);

    const procedimentosDisponiveis = useMemo(() => {
        if (agendaDiaria && agendaDiaria.procedimentos) {
            return agendaDiaria.procedimentos.map((procedimento) => procedimento.procedimento);
        }
        return [];
    }, [agendaDiaria]);

    const confirmar = async (tipo: TicketType) => {
        // A trava precisa ser a primeira coisa a acontecer, de forma
        // síncrona, antes de qualquer `await`. Do jeito que estava antes
        // (`setCreatingTicket(true)` só depois do primeiro await já ter
        // iniciado), dois toques rápidos em sequência conseguiam passar
        // pela checagem antes do estado ser atualizado e disparar duas
        // criações de ticket.
        if (creatingTicket || !selectedProcedimento) {
            return;
        }
        setCreatingTicket(true);

        const procedimento = selectedProcedimento;

        try {
            const senhaGerada = await createTicket(tipo, procedimento.id);

            try {
                await imprimirLocal({
                    code: senhaGerada.code,
                    type: senhaGerada.type,
                    procedimento: procedimento.description,
                    profissional: procedimento.nomeProfissional,
                    createdAt: senhaGerada.createdAt,
                });
            } catch (printError) {
                // A senha já foi criada no backend — a falha é só na
                // impressão local. Em vez de deixar o paciente sem saber o
                // código, mostramos na tela por tempo suficiente.
                console.error(printError);
                setPrintFallback({ code: senhaGerada.code, type: senhaGerada.type });
            }

            closeModal();
        } catch (error) {
            console.error(error);
            setActionError("Não foi possível gerar a senha. Tente novamente.");
        } finally {
            setCreatingTicket(false);
        }
    };

    return (
        <>
            {!connected && <ConnectionIndicator />}

            <BannerStack>
                {agendaError && (
                    <Banner variant={agendaDiaria ? "warning" : "error"}>
                        {agendaDiaria
                            ? "Não foi possível atualizar a agenda. Tentando novamente..."
                            : "Não foi possível carregar a agenda. Tentando novamente..."}
                    </Banner>
                )}

                {actionError && <Banner variant="error">{actionError}</Banner>}
            </BannerStack>

            {loading ? (
                <Loading />
            ) : (
                <Container>
                    <Logo src={logo} />
                    <Titulo>Selecione o Procedimento</Titulo>
                    {!agendaDiaria && agendaError ? (
                        <EmptyState>
                            Não foi possível carregar os procedimentos disponíveis no momento.
                            Estamos tentando novamente automaticamente.
                        </EmptyState>
                    ) : (
                        <Grid>
                            {procedimentosDisponiveis.map((proc) => (
                                <Card key={proc.id} onClick={() => {
                                    setSelectedProcedimento(proc);
                                    openModal();
                                }}>
                                    <strong>{proc.description}</strong>
                                    <span>{proc.nomeProfissional}</span>
                                </Card>
                            ))}
                        </Grid>
                    )}
                </Container>
            )}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={{
                    content: {
                        inset: "20%",
                        padding: 20,
                        borderRadius: 16,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 20,
                    },
                }}
            >
                <h2>{selectedProcedimento?.description}</h2>
                <p>{selectedProcedimento?.nomeProfissional}</p>
                <ButtonRow>
                    <ModalButton onClick={() => confirmar("IDOSO_80_MAIS")} disabled={creatingTicket}>
                        <strong>80+</strong> Prioridade
                    </ModalButton>
                    <ModalButton onClick={() => confirmar("PREFERENCIAL")} disabled={creatingTicket}>
                        <FaAccessibleIcon /> Preferencial
                    </ModalButton>
                    <ModalButton onClick={() => confirmar("NORMAL")} disabled={creatingTicket}>
                        <FaUser /> Normal
                    </ModalButton>
                </ButtonRow>
                <FecharButton onClick={closeModal}>Cancelar</FecharButton>
            </Modal>

            {printFallback && (
                <PrintFallbackOverlay>
                    <PrintFallbackCard>
                        <h2>Impressora indisponível</h2>
                        <p>Sua senha é:</p>
                        <PrintFallbackCode>{printFallback.code}</PrintFallbackCode>
                        <p>Anote o código acima e dirija-se à recepção.</p>
                        <FecharButton onClick={() => setPrintFallback(null)}>Fechar</FecharButton>
                    </PrintFallbackCard>
                </PrintFallbackOverlay>
            )}
        </>
    );
}

export default Totem;
