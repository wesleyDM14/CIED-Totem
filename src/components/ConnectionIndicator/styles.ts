import styled from "styled-components";
import { colors } from "../../styles/global";

export const Badge = styled.div`
    position: fixed;
    bottom: 12px;
    right: 12px;
    z-index: 999;
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.65);
    color: ${colors.white};
    font-size: 0.8rem;
    padding: 6px 12px;
    border-radius: 999px;
    pointer-events: none;
`;

export const Dot = styled.span`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${colors.red};
`;
