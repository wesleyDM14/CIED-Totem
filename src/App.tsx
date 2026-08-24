import Totem from "./pages/TotemSenha";
import ErrorBoundary from "./components/ErrorBoundary";

// Checagem de "?auth=<chave>" na URL, comparando com a mesma chave usada
// como x-api-key (VITE_APP_SECRET_KEY). Nota de segurança: como toda
// variável VITE_* é injetada em texto puro no bundle enviado ao navegador,
// qualquer pessoa que abra o "inspecionar" do site consegue ler essa chave
// e montar uma URL válida sozinha — isso NÃO impede um atacante técnico de
// acessar a tela. Serve só como uma barreira simples contra quem tenta abrir
// a URL "pelada" sem saber do parâmetro. A proteção real contra abuso em
// escala continua sendo o rate limiting nas rotas do totem, no backend.
function acessoAutorizado(): boolean {
  const chaveEsperada = import.meta.env.VITE_APP_SECRET_KEY;
  if (!chaveEsperada) return true; // sem chave configurada, não bloqueia
  const params = new URLSearchParams(window.location.search);
  return params.get('auth') === chaveEsperada;
}

// O ErrorBoundary abaixo cobre o caso de um erro de render não tratado em
// qualquer lugar da árvore: como o totem roda sem supervisão, ele não pode
// simplesmente ficar com a tela em branco — precisa se recuperar sozinho.
function App() {
  if (!acessoAutorizado()) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', color: '#666', textAlign: 'center', padding: 20 }}>
        Acesso não autorizado.
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Totem />
    </ErrorBoundary>
  );
}

export default App;
