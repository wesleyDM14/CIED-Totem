import { Badge, Dot } from "./styles";

/**
 * Indicador discreto de "sem conexão", mostrado num canto da tela enquanto
 * o socket.io está desconectado do servidor. Não bloqueia o uso do totem
 * (a pessoa ainda pode navegar pela agenda já carregada) mas deixa claro
 * que os dados podem estar desatualizados.
 */
const ConnectionIndicator: React.FC = () => {
    return (
        <Badge>
            <Dot />
            Sem conexão
        </Badge>
    );
};

export default ConnectionIndicator;
