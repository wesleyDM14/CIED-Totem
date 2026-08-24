import styled from "styled-components";
import { colors } from "../../styles/global";

export type BannerVariant = "error" | "warning" | "info";

const variantBackground: Record<BannerVariant, string> = {
    error: colors.red,
    warning: "#C9932C",
    info: colors.btnSecondary,
};

// Propositalmente sem `position: fixed` aqui: o Banner é só a "caixinha"
// visual. Quem o usa decide o posicionamento na tela — isso permite
// empilhar vários banners (ex.: erro de agenda + erro de ação) num único
// contêiner fixo, sem eles se sobreporem um no outro.
export const BannerWrapper = styled.div<{ $variant: BannerVariant }>`
    max-width: 100%;
    background: ${({ $variant }) => variantBackground[$variant]};
    color: ${colors.white};
    padding: 0.8rem 1.6rem;
    border-radius: 10px;
    font-size: 1rem;
    text-align: center;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
`;
