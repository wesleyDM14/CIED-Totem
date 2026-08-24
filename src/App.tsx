import Totem from "./pages/TotemSenha";
import ErrorBoundary from "./components/ErrorBoundary";

// Antes havia uma checagem de "?auth=<token>" aqui comparando com a mesma
// chave usada como x-api-key (VITE_APP_SECRET_KEY). Como toda variável
// VITE_* é injetada em texto puro no bundle enviado ao navegador, qualquer
// pessoa conseguia ler a chave e montar a URL válida — a checagem não
// protegia nada, só reaproveitava uma credencial de API para um fim que ela
// não cobre. A proteção real agora é no backend: rate limiting nas rotas do
// totem, para que uma chave extraída do bundle não sirva para abuso em
// escala. Controle de acesso à própria tela do totem (impedir que alguém de
// fora abra essa URL) precisa ser feito em nível de rede/host, não no app.
//
// O ErrorBoundary abaixo cobre o caso de um erro de render não tratado em
// qualquer lugar da árvore: como o totem roda sem supervisão, ele não pode
// simplesmente ficar com a tela em branco — precisa se recuperar sozinho.
function App() {
  return (
    <ErrorBoundary>
      <Totem />
    </ErrorBoundary>
  );
}

export default App;
