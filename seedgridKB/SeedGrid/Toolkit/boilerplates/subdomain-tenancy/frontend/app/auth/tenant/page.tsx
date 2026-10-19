"use client";

import { useState } from "react";
import Link from "next/link";
import { SgButton, SgInputText, SgStack } from "@seedgrid/fe-components";
import { AuthCard, AuthMessage } from "../AuthCard";

export default function TenantPage() {
  const [subdomain, setSubdomain] = useState("");
  const [error, setError] = useState<string | null>(null);

  function enter() {
    const tenant = subdomain.trim().toLowerCase();
    if (!/^[a-z0-9_]{5,50}$/.test(tenant) || tenant === "master") {
      setError("Informe o subdominio cadastrado para sua empresa.");
      return;
    }
    const target = new URL(window.location.origin);
    target.hostname = `${tenant}.${target.hostname}`;
    target.pathname = "/login";
    window.location.assign(target.toString());
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <AuthCard title="Entrar na sua empresa">
        <SgStack gap={16}>
          <SgInputText
            id="tenant-subdomain"
            label="Subdomínio"
            inputProps={{ value: subdomain }}
            onChange={setSubdomain}
          />
          {error && <AuthMessage tone="error">{error}</AuthMessage>}
          <SgButton label="Continuar" onClick={enter} />
          <Link href="/auth/signup" className="text-center underline">Cadastrar empresa</Link>
        </SgStack>
      </AuthCard>
    </div>
  );
}
