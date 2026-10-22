// Base da API do backend (env `SEEDGRID_APP_API_BASE_URL`). Arquivo proprio, sem imports, para
// poder ser lido pelo `proxy.ts` (rewrite de `/api/q/**`) e pelos testes sem carregar o cliente HTTP.
// `lib/seedgrid-app-api.ts` re-exporta `apiBaseUrl`; quem ja importa de la nao muda nada.
//
// URL da API: env `SEEDGRID_APP_API_BASE_URL`, com a API local como default.
//
// O seedgrid-report-client, de onde este arquivo veio, escolhia por `DEBUG_MODE` entre a API local
// e o dominio de PRODUCAO DELE, hardcoded (mesmo criterio do client Tauri -- ver
// seedgrid-report-client/src-tauri/src/lib.rs, resolve_api_base_url). Num boilerplate isso nao
// pode ficar: cada produto clonado apontaria, por default, para a API de OUTRO produto -- e o
// sintoma nao seria erro de conexao, seria autenticar contra o backend errado.
//
// Com o dominio fora, o `DEBUG_MODE` deixou de escolher qualquer coisa (os dois ramos viravam a
// mesma URL), entao ele saiu junto em vez de virar um ternario que nao decide nada. Quem publica
// define a env; sem ela, aponta para a API local, que e o default seguro. Mesma regra do `admin`.
//
// 127.0.0.1 e NAO localhost: a API sobe ligada so' a interface IPv4, e no Windows
// `localhost` resolve ::1 primeiro -- a conexao IPv6 falha e o fallback para IPv4
// custa ~200ms POR CONEXAO NOVA. Medido: 2-5ms por 127.0.0.1 contra 214-244ms por
// localhost, com o custo todo no connect, antes de qualquer processamento.
const LOCAL_API_BASE_URL = "http://127.0.0.1:8080";

export const apiBaseUrl =
  process.env.SEEDGRID_APP_API_BASE_URL?.trim() || LOCAL_API_BASE_URL;
