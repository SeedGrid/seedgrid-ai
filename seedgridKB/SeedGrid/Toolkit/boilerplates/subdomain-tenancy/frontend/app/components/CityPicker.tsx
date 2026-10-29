"use client";

import { SgAutocomplete, SgCombobox, SgGrid, SgStack } from "@seedgrid/fe-components";
import { useEffect, useMemo, useRef, useState } from "react";

import { StatusBadge } from "./StatusBadge";
import { BRAZIL_STATES } from "@/lib/companies";
import {
  CITY_SEARCH_MIN_LENGTH,
  createCitySearch,
  type CityFetcher,
  type CityOption,
  type CityRef,
} from "@/lib/cities";
import { adminProxyClient } from "@/lib/core";

const STATE_ITEMS = BRAZIL_STATES.map((uf) => ({ id: uf, label: uf, value: uf }));

type CityPickerProps = {
  /** Prefixo dos ids no DOM: `<prefix>-state` e `<prefix>-city`. */
  idPrefix: string;
  uf: string;
  cityId: number | null;
  cityName: string;
  /** Texto legado da cidade (empresa antiga, sem `cityId`): so' vira dica para escolher a cidade. */
  legacyCityText?: string;
  /** Trocar a UF zera a cidade (a cidade pertence a uma UF). */
  onUfChange: (uf: string) => void;
  /** `null` = cidade limpa. */
  onCityChange: (city: { id: number; name: string } | null) => void;
  /** So' para teste/injecao; o padrao fala com o BFF `/api/cities/**`. */
  fetcher?: CityFetcher;
};

const defaultFetcher: CityFetcher = (path) => adminProxyClient.get(path);

/** Escolha da cidade do endereco: UF (lista fixa) + busca de cidade por nome na REST da cities. */
export function CityPicker({
  idPrefix,
  uf,
  cityId,
  cityName,
  legacyCityText,
  onUfChange,
  onCityChange,
  fetcher = defaultFetcher,
}: Readonly<CityPickerProps>) {
  const search = useMemo(() => createCitySearch(fetcher), [fetcher]);
  const source = useMemo(() => (query: string) => search(uf, query), [search, uf]);

  // Texto do campo: fica aqui (e nao em `cityName`) porque digitar zera o `cityId` e o campo nao pode ser
  // apagado junto enquanto a pessoa escreve.
  const [text, setText] = useState(cityName);
  // A ultima cidade escolhida: o SgAutocomplete devolve o texto ao sair do campo sem escolher e, nesse
  // caso, o `cityId` precisa voltar junto com o texto (senao o campo mostraria uma cidade sem FK).
  const lastChosen = useRef<{ id: number; name: string } | null>(null);
  useEffect(() => {
    if (cityId != null) {
      lastChosen.current = { id: cityId, name: cityName };
      setText(cityName);
    }
  }, [cityId, cityName]);

  function handleText(next: string) {
    setText(next);
    if (next === "") {
      onCityChange(null);
      return;
    }
    const chosen = lastChosen.current;
    if (chosen && chosen.name === next) {
      onCityChange(chosen);
    } else if (cityId != null) {
      // Escrever outra coisa desfaz a escolha: so' vale a cidade escolhida na lista.
      onCityChange(null);
    }
  }

  function handleUf(next: string) {
    setText("");
    lastChosen.current = null;
    onUfChange(next);
  }

  function handleSelect(item: { id: string | number; label: string; data?: unknown }) {
    const ref = item.data as CityRef | undefined;
    const choice = { id: Number(ref?.id ?? item.id), name: ref?.name ?? item.label };
    lastChosen.current = choice;
    setText(choice.name);
    onCityChange(choice);
  }

  let legacyNotice: string | null = null;
  if (cityId == null && text) {
    legacyNotice = "Escolha a cidade na lista para ela ser gravada.";
  } else if (cityId == null && legacyCityText) {
    legacyNotice = `Cidade cadastrada so' em texto: ${legacyCityText}. Escolha a cidade.`;
  }

  return (
    <SgStack gap={8}>
    <SgGrid minItemWidth={180} gap={12}>
      <SgCombobox
        id={`${idPrefix}-state`}
        label="UF"
        source={STATE_ITEMS}
        value={uf || null}
        onValueChange={(value) => handleUf(value ? String(value) : "")}
      />
      <SgAutocomplete<CityOption>
        key={uf || "sem-uf"}
        id={`${idPrefix}-city`}
        label="Cidade"
        enabled={Boolean(uf)}
        hintText={uf ? `Digite ao menos ${CITY_SEARCH_MIN_LENGTH} letras do nome` : "Escolha a UF primeiro"}
        source={source}
        minLengthForSearch={CITY_SEARCH_MIN_LENGTH}
        maxResult={20}
        cacheEnabled={false}
        allowCustomValue
        value={text}
        onChange={handleText}
        onSelect={handleSelect}
      />
    </SgGrid>
    {legacyNotice ? <StatusBadge severity="info" value={legacyNotice} /> : null}
    </SgStack>
  );
}
