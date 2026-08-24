# Totem de Senhas — CIED

Aplicação React + TypeScript + Vite que roda em tela cheia numa Raspberry Pi
na recepção da clínica, permitindo que o paciente selecione o procedimento
agendado e gere sua senha de atendimento (Normal, Preferencial ou 80+).

## Operação sem supervisão (importante)

Este app roda **24 horas por dia, todos os dias, sem ninguém para
reiniciar o equipamento fisicamente**. Qualquer alteração no código precisa
levar isso em conta:

- Erros não tratados são capturados por um `ErrorBoundary`
  (`src/components/ErrorBoundary`) que mostra uma tela de recuperação e
  recarrega a página automaticamente.
- A página se recarrega sozinha uma vez por dia, de madrugada (janela das
  3h às 4h, horário local do equipamento), para limpar qualquer estado
  acumulado — ver `src/utils/watchdog.ts`.
- Se a busca da agenda ficar falhando por 5 minutos seguidos, a página força
  um reload completo em vez de continuar tentando indefinidamente em
  memória.
- Falhas de carregamento de chunk (comuns quando a aba fica aberta por dias
  e um novo deploy invalida os arquivos JS antigos em cache) também disparam
  um reload automático.

Se você alterar esses mecanismos, teste o comportamento de erro
propositalmente (derrube o backend, desconecte a rede) antes de publicar em
produção — não há ninguém na clínica para diagnosticar uma tela travada.

## Variáveis de ambiente

Configure um arquivo `.env` na raiz do projeto com:

| Variável | Descrição |
| --- | --- |
| `VITE_BASE_URL` | URL base da API do backend (ex.: `https://api.ciedcomplexohospitalar.com.br`). Usada tanto para chamadas HTTP quanto para a conexão do socket.io. |
| `VITE_APP_SECRET_KEY` | Chave enviada no header `x-api-key` nas requisições ao backend. **Atenção:** por ser uma variável `VITE_*`, ela é injetada em texto puro no bundle enviado ao navegador — qualquer pessoa com acesso ao totem consegue lê-la. A proteção contra abuso dessa chave é feita no backend via rate limiting nas rotas do totem, não pela ocultação do valor. |

Nunca versione o `.env` real com credenciais de produção fora deste
repositório privado.

## Dependência do serviço de impressão local

A emissão física da senha depende de um serviço de impressão rodando
**localmente na mesma máquina do totem**, escutando em `http://localhost:3333`
(ver `src/services/ticketService.ts`, função `imprimirLocal`). Esse serviço
não faz parte deste repositório — precisa estar instalado e em execução na
Raspberry Pi para que a impressão funcione.

Se o serviço de impressão estiver fora do ar ou a impressora falhar, o
totem não trava: a senha já foi criada no backend, e o código é exibido na
própria tela por um tempo para o paciente anotar.

## Rodando localmente

```bash
yarn install
yarn dev
```

## Build de produção

```bash
yarn build
```

Gera os arquivos estáticos em `dist/`, que devem ser servidos pelo
navegador em modo kiosk na Raspberry Pi.
