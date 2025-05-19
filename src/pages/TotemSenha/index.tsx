import { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import type { Procedimento, Schedule } from "../../contexts/interfaces";
import { getAgendamentoDiario } from "../../services/agendaService";
import Loading from "../../components/Loading";
import { ButtonRow, Card, Container, FecharButton, Grid, Logo, ModalButton, Titulo } from "./styles";
import logo from '../../assets/CIED.png';
import { FaAccessibleIcon, FaUser } from "react-icons/fa";
import { createTicket, imprimirLocal } from "../../services/ticketService";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BASE_URL);

const Totem: React.FC = () => {

    const rootElement = document.getElementById('root');
    if (rootElement) {
        Modal.setAppElement(rootElement);
    }

    const [loading, setLoading] = useState<boolean>(true);
    const [agendaDiaria, setAgendaDiaria] = useState<Schedule>();
    const [selectedProcedimento, setSelectedProcedimento] = useState<Procedimento | null>(null);

    const [modalIsOpen, setModalIsOpen] = useState(false);

    const [creatingTicket, setCreatingTicket] = useState<boolean>(false);

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedProcedimento(null);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (loading) {
                try {
                    await getAgendamentoDiario(new Date(), setAgendaDiaria);
                } catch (error) {
                    console.log(error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchData();
    }, [loading]);

    useEffect(() => {
        socket.on('agenda-atualizada', (data: string) => {
            console.log('Agenda foi atualizada!', data);
            setLoading(true); // força o re-fetch
        });

        return () => {
            socket.off('agenda-atualizada', (data: string) => {
                console.log('Agenda foi atualizada!', data);
                setLoading(true); // força o re-fetch
            });
        };
    }, []);

    const procedimentosDisponiveis = useMemo(() => {
        if (agendaDiaria && agendaDiaria.procedimentos) {
            return agendaDiaria.procedimentos.map((procedimento) => ({
                ...procedimento.procedimento,
                dailyScheduleId: agendaDiaria.id,
            }));
        }
        return [];
    }, [agendaDiaria]);

    const confirmar = async (tipo: "NORMAL" | "PREFERENCIAL") => {
        if (selectedProcedimento) {
            try {
                setCreatingTicket(true);
                const senhaGerada = await createTicket(tipo, selectedProcedimento.id);
                console.log(senhaGerada);

                await imprimirLocal({
                    code: senhaGerada.code,
                    type: senhaGerada.type,
                    procedimento: selectedProcedimento.description,
                    profissional: selectedProcedimento.nomeProfissional,
                    createdAt: senhaGerada.createdAt,
                });
            } catch (error) {
                console.log(error);
                window.alert('Erro ao gerar a Senha.');
            } finally {
                setCreatingTicket(false);
                closeModal();
            }
        }
    };

    return (
        <>
            {
                loading ? (
                    <Loading />
                ) : (
                    <Container>
                        <Logo src={logo} />
                        <Titulo>Selecione o Procedimento</Titulo>
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
                    </Container>
                )
            }
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
                    <ModalButton onClick={() => confirmar("NORMAL")} disabled={creatingTicket}>
                        <FaUser /> Normal
                    </ModalButton>
                    <ModalButton onClick={() => confirmar("PREFERENCIAL")} disabled={creatingTicket}>
                        <FaAccessibleIcon /> Preferencial
                    </ModalButton>
                </ButtonRow>
                <FecharButton onClick={closeModal}>Cancelar</FecharButton>
            </Modal>

        </>
    );
}

export default Totem;