import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Container, Message, ReloadButton, Title } from "./styles";

interface Props {
    children: ReactNode;
    /** Segundos até o reload automático depois de um erro capturado. */
    autoReloadSeconds?: number;
}

interface State {
    hasError: boolean;
}

/**
 * Error Boundary de topo de aplicação.
 *
 * O totem roda 24h por dia sem supervisão numa Raspberry Pi: se um erro de
 * render não tratado acontecer, o React deixa a tela em branco e ninguém
 * está lá pra perceber. Este componente captura qualquer exceção não
 * tratada na árvore, mostra uma tela amigável e recarrega a página
 * automaticamente depois de alguns segundos (além de permitir reiniciar
 * manualmente), evitando que o equipamento fique travado indefinidamente.
 */
class ErrorBoundary extends Component<Props, State> {
    private reloadTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Erro não tratado capturado pelo ErrorBoundary:", error, errorInfo);

        const seconds = this.props.autoReloadSeconds ?? 15;
        this.reloadTimeout = setTimeout(() => {
            window.location.reload();
        }, seconds * 1000);
    }

    componentWillUnmount() {
        if (this.reloadTimeout) {
            clearTimeout(this.reloadTimeout);
        }
    }

    handleReloadClick = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <Container>
                    <Title>Ocorreu um problema inesperado</Title>
                    <Message>
                        O sistema será reiniciado automaticamente em instantes. Se a tela não
                        voltar ao normal, toque no botão abaixo.
                    </Message>
                    <ReloadButton onClick={this.handleReloadClick}>Reiniciar agora</ReloadButton>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
