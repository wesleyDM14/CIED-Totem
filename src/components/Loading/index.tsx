import logo from '../../assets/CIED.png';
import { LoadingContainer, Logo } from "./styles";

const Loading = () => {

    return (
        <LoadingContainer>
            <Logo src={logo} alt='Logo da empresa' />
        </LoadingContainer>
    );
};

export default Loading;