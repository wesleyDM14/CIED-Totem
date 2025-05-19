import { ThreeDots } from "react-loader-spinner";
import { colors } from "../../styles/global";
import logo from '../../assets/CIED.png';
import { LoadingContainer, Logo } from "./styles";

const Loading = () => {

    return (
        <LoadingContainer>
            <Logo src={logo} alt='Logo da empresa' />
            <ThreeDots color={colors.icon} height={49} width={100} />
        </LoadingContainer>
    );
};

export default Loading;