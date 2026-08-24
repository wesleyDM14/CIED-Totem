import styled from "styled-components";
import { colors } from "../../styles/global";

export const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.2rem;
    padding: 2rem;
    text-align: center;
    background: ${colors.background};
`;

export const Title = styled.h1`
    font-size: 1.8rem;
    color: ${colors.title};
`;

export const Message = styled.p`
    font-size: 1.1rem;
    color: ${colors.description};
    max-width: 480px;
`;

export const ReloadButton = styled.button`
    padding: 0.9rem 2rem;
    font-size: 1.1rem;
    border: none;
    border-radius: 8px;
    background-color: ${colors.btnPrimary};
    color: ${colors.title};
    font-weight: bold;
`;
