import { createGlobalStyle } from "styled-components";

export const colors = {
    title: '#1A332D',
    background: '#F4F4F4',
    sidebar: '#1A332D',
    mainText: '#424242',
    description: '#6E6E6E',
    icon: '#E2C27B',
    hover: '#F1E2B3',
    btnPrimary: '#E2C27B',
    btnSecondary: '#1A332D',
    white: '#FFFFFF',
    red: '#E74C3C',
    greenNeutral: '#27AE60',
    darkGray: '#6E6E6E',
    slimGray: '#D1D1D1',
    navbar: '#1A332D'
}

export const GlobalStyle = createGlobalStyle`
    *{
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        touch-action: manipulation;
    }

    html, body, #root {
        width: 100%;
        height: 100vh;
        overflow: hidden;
        background-color: #f4f4f4;
        font-family: 'Arial', sans-serif;
    }

    body {
        display: flex;
        justify-content: center;
        align-items: center;
        transform: rotate(0deg);
        orientation: landscape;
    }

    button {
        cursor: pointer;
    }
`;