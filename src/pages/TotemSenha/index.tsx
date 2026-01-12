import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import { io } from "socket.io-client";

// Interfaces e Services
import type { Procedimento, Schedule } from "../../contexts/interfaces";
import { getAgendamentoDiario } from "../../services/agendaService";
import { createTicket, imprimirLocal } from "../../services/ticketService";

// Componentes e Estilos
import Loading from "../../components/Loading";
import { ButtonRow, Card, Container, FecharButton, Grid, Logo, ModalButton, Titulo } from "./styles";
import logo from '../../assets/CIED.png';
import { FaAccessibleIcon, FaUser } from "react-icons/fa";

// ================= CONFIGURAÇÃO DO SOCKET =================
// Inicializa fora do componente para evitar múltiplas conexões
const socket = io(import.meta.env.VITE_BASE_URL, {
    transports: ['websocket', 'polling'], // Tenta websocket primeiro (mais rápido)
    reconnection: true,                   // Tenta reconectar se cair
    reconnectionAttempts: 10,
    autoConnect: true
});

type TicketType = "NORMAL" | "PREFERENCIAL" | "IDOSO_80_MAIS";

const Totem: React.FC = () => {

    const rootElement = document.getElementById('root');
    if (rootElement) {
        Modal.setAppElement(rootElement);
    }

    // Estados
    const [loading, setLoading] = useState<boolean>(true);
    const [agendaDiaria, setAgendaDiaria] = useState<Schedule>();
    const [selectedProcedimento, setSelectedProcedimento] = useState<Procedimento | null>(null);

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [creatingTicket, setCreatingTicket] = useState<boolean>(false);

    // ================= SOCKET.IO LISTENERS =================
    useEffect(() => {
        // Função que será chamada quando o backend avisar que a agenda mudou
        const handleUpdate = (data: any) => {
            console.log("🔄 Recebido sinal 'agenda-atualizada' do Backend:", data);
            setLoading(true); // Isso dispara o useEffect de busca abaixo
        };

        // Eventos de Conexão (Para Debug)
        socket.on("connect", () => {
            console.log("🟢 Totem CONECTADO ao Socket. ID:", socket.id);
        });

        socket.on("connect_error", (err) => {
            console.error("🔴 Erro de conexão com Socket:", err.message);
        });

        // Ouve o evento principal
        socket.on("agenda-atualizada", handleUpdate);

        // Cleanup ao desmontar
        return () => {
            socket.off("connect");
            socket.off("connect_error");
            socket.off("agenda-atualizada", handleUpdate);
        };
    }, []);

    // ================= BUSCA DE DADOS =================
    useEffect(() => {
        const fetchData = async () => {
            if (loading) {
                console.log("📥 Buscando agenda atualizada...");
                try {
                    await getAgendamentoDiario(new Date(), setAgendaDiaria);
                } catch (error) {
                    console.error("Erro ao buscar agenda:", error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchData();
    }, [loading]);

    // ================= LÓGICA DE DADOS =================
    const procedimentosDisponiveis = useMemo(() => {
        if (agendaDiaria && agendaDiaria.procedimentos) {
            return agendaDiaria.procedimentos.map((procedimento) => ({
                ...procedimento.procedimento, // Dados do procedimento (nome, id)
                dailyScheduleId: agendaDiaria.id,
                // Mapeia os profissionais deste item da agenda
                nomeProfissional: procedimento.profissionais
                    ? procedimento.profissionais.map(p => p.name).join(', ')
                    : 'A definir'
            }));
        }
        return [];
    }, [agendaDiaria]);

    // ================= AÇÕES DA UI =================
    const openModal = () => setModalIsOpen(true);

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedProcedimento(null);
    };

    const confirmar = async (tipo: TicketType) => {
        if (selectedProcedimento) {
            try {
                setCreatingTicket(true);

                // 1. Cria Senha no Backend (Nuvem)
                const senhaGerada = await createTicket(tipo, selectedProcedimento.id);

                // 2. Manda Imprimir (Local USB)
                await imprimirLocal({
                    code: senhaGerada.code,
                    type: senhaGerada.type,
                    procedimento: selectedProcedimento.description || selectedProcedimento.name || "Exame",
                    profissional: selectedProcedimento.nomeProfissional || "",
                    createdAt: senhaGerada.createdAt,
                });

                closeModal();
            } catch (error) {
                console.error(error);
                window.alert('Erro ao gerar a Senha. Verifique a conexão.');
            } finally {
                setCreatingTicket(false);
            }
        }
    };

    // ================= RENDER =================
    return (
        <>
            {loading ? (
                <Loading />
            ) : (
                <Container>
                    <Logo src={logo} />
                    <Titulo>Selecione o Procedimento</Titulo>

                    {procedimentosDisponiveis.length === 0 ? (
                        <div style={{ marginTop: 50, color: '#666', fontSize: 18 }}>
                            Nenhum procedimento disponível na agenda de hoje.
                        </div>
                    ) : (
                        <Grid>
                            {procedimentosDisponiveis.map((proc) => (
                                <Card key={proc.id} onClick={() => {
                                    setSelectedProcedimento(proc);
                                    openModal();
                                }}>
                                    <strong>{proc.description || proc.name}</strong>
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
                <h2 style={{ textAlign: 'center', color: '#333' }}>
                    {selectedProcedimento?.description || selectedProcedimento?.name}
                </h2>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>{selectedProcedimento?.nomeProfissional}</p>

                <div style={{ width: '100%', height: '1px', background: '#eee', margin: '10px 0' }} />

                <p style={{ fontWeight: 'bold', marginBottom: 10 }}>Selecione o tipo de atendimento:</p>

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

                <FecharButton onClick={closeModal} disabled={creatingTicket}>
                    {creatingTicket ? 'Imprimindo...' : 'Cancelar'}
                </FecharButton>
            </Modal>
        </>
    );
}

export default Totem;