"use client";

import { SgStack } from "@seedgrid/fe-components";

import { SeedGridLogoFull } from "./components/SeedGridLogoFull";
import { Shell } from "./components/Shell";

/**
 * Home do app do cliente.
 *
 * A `page.tsx` do report-admin era a "Visao Geral" do backoffice (saude da IA, dashboard da
 * plataforma, auditoria recente, ultimas requisicoes de IA) — dominio inteiro, e por isso nao veio.
 * No lugar dela entra a `views/welcome/WelcomeView.tsx` do report-client, portada para o Shell:
 * marca, uma frase e a orientacao de procurar o administrador. Sem dado nenhum, de proposito — e'
 * a tela de quem acabou de entrar e ainda nao tem acesso a nada.
 *
 * Nao tem permissao no `navItems` porque nao esta no menu: e' so' a raiz `/`.
 */
export default function HomePage() {
  return (
    <Shell
      eyebrow="Inicio"
      title="Bem-vindo"
      description="Sua conta, seus usuarios e sua assinatura em um lugar so."
    >
      <SgStack align="center" gap={20} style={{ padding: "48px 0", textAlign: "center" }}>
        <SeedGridLogoFull />
        <p style={{ maxWidth: 520, fontSize: 15, opacity: 0.75 }}>
          Use o menu lateral para administrar os usuarios e os perfis de acesso da sua conta, e
          conferir a auditoria do que foi feito nela.
        </p>
        <p style={{ maxWidth: 520, fontSize: 14, opacity: 0.6 }}>
          Seu plano, suas faturas e a forma de pagamento ficam em{" "}
          <strong>Minha assinatura</strong>, no menu do seu usuario.
        </p>
      </SgStack>
    </Shell>
  );
}
