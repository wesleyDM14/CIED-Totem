import type { ReactNode } from "react";
import type { BannerVariant } from "./styles";
import { BannerWrapper } from "./styles";

interface BannerProps {
    variant?: BannerVariant;
    children: ReactNode;
}

/**
 * Banner de feedback na própria tela (toast/aviso fixo no topo).
 *
 * O totem não tem teclado físico nem alguém supervisionando: `window.alert`
 * trava a UI inteira sem estilo e exige um clique físico em "OK" num
 * dispositivo que ninguém está tocando. Este componente mostra o mesmo tipo
 * de aviso sem bloquear a interface.
 */
const Banner: React.FC<BannerProps> = ({ variant = "error", children }) => {
    return <BannerWrapper $variant={variant}>{children}</BannerWrapper>;
};

export default Banner;
