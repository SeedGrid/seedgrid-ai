import { LoginTenancyPaths } from "@/lib/login-tenancy-paths";
import {
  fetchWithAdminSession,
  passthroughResponse,
} from "@/lib/seedgrid-app-api-server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// Upstream: LoginTenancyUserController#resendActivation
// (`POST /me/security/users/{id}/resend-activation`) — novo token + nova senha inicial para quem
// ainda nao confirmou o e-mail. Rota nova aqui porque o report-admin nao tem equivalente: o
// endpoint e' do controller `/me` da extension, que so' o app do cliente consome (no
// report-client e' o comando `resend_user_activation`, comandos/security.rs).
export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();
  const response = await fetchWithAdminSession(
    LoginTenancyPaths.users.resendActivation(id),
    { method: "POST", body: body || "{}" },
  );
  return passthroughResponse(response);
}
