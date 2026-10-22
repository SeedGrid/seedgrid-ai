"use client";

import { SgButton, SgStack, SgToggleSwitch } from "@seedgrid/fe-components";
import { useState } from "react";

import type { SignupConfig } from "@/lib/ported/portedApi";
import { buildStartPath, canStartSocial, enabledProviders, providerLabel } from "./socialLogin";

const TERMS_LABELS: Record<string, string> = { terms: "Termos de uso", privacy: "Política de privacidade" };

interface SocialLoginButtonsProps {
  /** `GET /public/signup/config`; enquanto carrega (`null`) nada e' desenhado. */
  readonly config: SignupConfig | null;
  /** "login" mostra "Entrar com ..."; "signup" mostra "Continuar com ..." (o cadastro e' feito no retorno). */
  readonly intent?: "login" | "signup";
}

/**
 * Botoes "Entrar com Google/Facebook" para a tela de login e de cadastro. Os provedores vem de
 * `socialProviders` do config do host; sem lista nao aparece nada. Com `termsRequired`, o aceite fica AO LADO
 * dos botoes e eles so' habilitam aceito — a versao aceita vai ao backend como `termsVersion`.
 * Clicar navega o navegador inteiro (`window.location`), porque o fluxo e' redirecionamento ao backend.
 */
export function SocialLoginButtons({ config, intent = "login" }: SocialLoginButtonsProps) {
  const [accepted, setAccepted] = useState(false);
  const providers = enabledProviders(config);
  if (!config || providers.length === 0) {
    return null;
  }

  const documents = Object.entries(config.termsDocuments ?? {});
  const enabled = canStartSocial(config, accepted);
  const verb = intent === "signup" ? "Continuar com" : "Entrar com";

  function start(provider: string) {
    if (!config || !canStartSocial(config, accepted)) {
      return;
    }
    window.location.assign(buildStartPath(provider, config, accepted));
  }

  return (
    <SgStack gap={12}>
      <div className="flex items-center gap-3 text-sm text-sg-muted" role="separator" aria-label="ou">
        <span className="h-px flex-1 bg-sg-border" />
        <span>ou</span>
        <span className="h-px flex-1 bg-sg-border" />
      </div>
      {config.termsRequired ? (
        <>
          <SgToggleSwitch
            id="social-terms"
            label="Li e aceito os termos"
            checked={accepted}
            onChange={setAccepted}
          />
          {documents.length > 0 ? (
            <p className="text-sm text-sg-muted">
              {documents.map(([name, url], index) => (
                <span key={name}>
                  {index > 0 ? " · " : ""}
                  <a href={url} target="_blank" rel="noreferrer" className="underline">
                    {TERMS_LABELS[name] ?? name}
                  </a>
                </span>
              ))}
            </p>
          ) : null}
        </>
      ) : null}
      {providers.map((provider) => (
        <SgButton
          key={provider}
          appearance="outline"
          severity="secondary"
          type="button"
          disabled={!enabled}
          className="w-full"
          onClick={() => start(provider)}
        >
          {`${verb} ${providerLabel(provider)}`}
        </SgButton>
      ))}
    </SgStack>
  );
}
