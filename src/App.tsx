import Totem from "./pages/TotemSenha";

const expectedToken = import.meta.env.VITE_APP_SECRET_KEY;

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const receivedToken = urlParams.get("auth");

  if (receivedToken !== expectedToken) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", fontSize: "24px", color: "red" }}>
        <h1>Acesso negado</h1>
        <p>Token inválido ou ausente.</p>
      </div>
    );
  }

  return <Totem />;
}

export default App;
