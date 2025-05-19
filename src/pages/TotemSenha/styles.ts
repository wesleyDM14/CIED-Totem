import styled from "styled-components";
import { colors } from "../../styles/global";

export const Container = styled.div`
  width: 100vw;
  height: 100vh;
  padding: 2vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
`;

export const Titulo = styled.h1`
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2vh;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 1000px;
  margin-top: 2vh;
`;

export const Card = styled.div`
  background: ${colors.btnSecondary};
  color: white;
  padding: 1.5rem;
  border-radius: 16px;
  font-size: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 180px;
  min-width: 200px;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  text-align: center;

  &:hover {
    transform: scale(1.03);
  }

  strong {
    margin-bottom: 0.5rem;
  }

  span {
    font-size: 0.9rem;
    color: #ddd;
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 20px;
`;

export const ModalButton = styled.button<{ disabled?: boolean }>`
    padding: 1rem 2rem;
    font-size: 1.5rem;
    border: none;
    border-radius: 8px;
    background-color: ${({ disabled }) => (disabled ? '#999' : '#27AE60')};
    color: white;
    display: flex;
    align-items: center;
    gap: 10px;
    opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
`;

export const FecharButton = styled.button`
  margin-top: 1rem;
  padding: 0.8rem 1.6rem;
  background: ${colors.red};
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  color: ${colors.white};
`;

export const Logo = styled.img`
  width: 250px;
  height: 120px;
  object-fit: contain;
  margin-bottom: 20px;
`;
