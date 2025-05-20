import styled from "styled-components";

export const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
`;

export const Logo = styled.img`
    width: 200px;
    height: auto;
    margin: 5px;

    @media only screen and (max-width: 978px) {
        width: 85px;
    }
`;