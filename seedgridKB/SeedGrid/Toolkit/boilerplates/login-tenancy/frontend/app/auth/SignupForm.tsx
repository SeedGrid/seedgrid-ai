"use client";

// PORTADO do `seedgrid-report-client`: src/views/auth/SignupForm.tsx (1.041 linhas)
//
// A tela veio LITERAL — JSX, estado, validacao, mensagens e ordem das chamadas sao os mesmos.
// Trocou-se APENAS o transporte:
//   - `invoke("sign_up" | "check_email_exists" | "signup_cnpj_status" | "lookup_cnpj" |
//   -   "confirm_signup_email" | "resend_signup_email")` -> `fetch` para `/api/signup/**`,
//   -   pelo `lib/ported/portedApi.ts` (as funcoes mantem nome, assinatura e tipo de retorno);
//   - `@tauri-apps/plugin-log` (`void log.info/error`) -> `console.info/error`.
//
// "use client" no topo porque no Next isto e' componente de cliente (o original ja' era: era um
// SPA inteiro no browser do Tauri).

import { useCallback, useRef, useState } from "react";

import {
  SgButton,
  SgGrid,
  SgInputBirthDate,
  SgInputCNPJ,
  SgInputCPF,
  SgInputEmail,
  SgInputOTP,
  SgInputPassword,
  SgInputPhone,
  SgInputPostalCode,
  SgInputText,
  SgStack,
  SgWizard,
  SgWizardPage,
  sgWhistle,
  type ViaCepResponse,
} from "@seedgrid/fe-components";
import { Building2, MapPinned, Rocket, ShieldCheck } from "lucide-react";
import { useForm, useWatch, type Control } from "react-hook-form";

// O reenvio precisa do e-mail. Quando o formulario abre direto na confirmacao
// (vindo do "Nao recebi o e-mail" do login), deixamos o e-mail editavel; vindo do
// proprio cadastro, ele ja esta preenchido e so exibimos como texto.

import {
  checkEmailExists,
  confirmSignupEmail,
  lookupCnpj,
  resendSignupEmail,
  signUp,
  signupCnpjStatus,
  type SignupPayload,
} from "@/lib/ported/portedApi";
import type { CnpjSignupStatus } from "@/lib/ported/billingTypes";
import { readError } from "@/lib/ported/clientError";
import { AuthCard, AuthMessage } from "./AuthCard";

interface SignupFormProps {
  readonly onBackToLogin: () => void;
  /**
   * Abre o formulario direto no estagio de confirmacao (reenvio de e-mail) — usado
   * pelo "Nao recebi o e-mail" do login, quando a conta ja foi criada mas o e-mail
   * de confirmacao nao chegou.
   */
  readonly initialStage?: Stage;
  readonly initialEmail?: string;
}

type Stage = "form" | "confirm";

interface SignupFormValues {
  cnpj: string;
  corporateName: string;
  tradeName: string;
  addressPostalCode: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string;
  addressDistrict: string;
  addressCity: string;
  addressState: string;
  addressPhone: string;
  legalCpf: string;
  legalFirstName: string;
  legalLastName: string;
  legalBirthDate: string;
  legalPhone: string;
  legalWhatsapp: string;
  rootEmail: string;
  plainRootPassword: string;
  confirmPassword: string;
}

type SignupField = keyof SignupFormValues;

function emptyForm(): SignupFormValues {
  return {
    cnpj: "",
    corporateName: "",
    tradeName: "",
    addressPostalCode: "",
    addressStreet: "",
    addressNumber: "",
    addressComplement: "",
    addressDistrict: "",
    addressCity: "",
    addressState: "",
    addressPhone: "",
    legalCpf: "",
    legalFirstName: "",
    legalLastName: "",
    legalBirthDate: "",
    legalPhone: "",
    legalWhatsapp: "",
    rootEmail: "",
    plainRootPassword: "",
    confirmPassword: "",
  };
}

// Ids dos inputs no DOM. Ficam num mapa (e nao soltos no JSX) porque os inputs Sg em modo
// `register` sao NAO CONTROLADOS: para preencher um campo por codigo (consulta de CNPJ/CEP)
// precisamos alcancar o elemento pelo id — ver `applyValue`.
const FIELD_ID = {
  cnpj: "signup-cnpj",
  corporateName: "signup-corporate-name",
  tradeName: "signup-trade-name",
  addressPostalCode: "signup-postal-code",
  addressStreet: "signup-street",
  addressNumber: "signup-number",
  addressComplement: "signup-complement",
  addressDistrict: "signup-district",
  addressCity: "signup-city",
  addressState: "signup-state",
  addressPhone: "signup-address-phone",
  legalCpf: "signup-cpf",
  legalFirstName: "signup-first-name",
  legalLastName: "signup-last-name",
  legalBirthDate: "signup-birth-date",
  legalPhone: "signup-legal-phone",
  legalWhatsapp: "signup-whatsapp",
  rootEmail: "signup-root-email",
  plainRootPassword: "signup-password",
  confirmPassword: "signup-confirm",
} as const satisfies Record<SignupField, string>;

// Campos obrigatorios + rotulo, para a checagem final no submit. Os campos de paginas ja
// visitadas ficam desmontados no fim do wizard e o RHF nao valida campo desmontado — entao
// esta lista e a ultima trava antes de mandar o payload.
const REQUIRED_FIELDS: ReadonlyArray<readonly [SignupField, string]> = [
  ["cnpj", "CNPJ"],
  ["corporateName", "Razão social"],
  ["tradeName", "Nome fantasia"],
  ["addressPhone", "Telefone da empresa"],
  ["addressPostalCode", "CEP"],
  ["addressStreet", "Logradouro"],
  ["addressNumber", "Número"],
  ["addressDistrict", "Bairro"],
  ["addressCity", "Cidade"],
  ["addressState", "UF"],
  ["legalFirstName", "Nome do responsável"],
  ["legalLastName", "Sobrenome do responsável"],
  ["legalCpf", "CPF"],
  ["legalBirthDate", "Nascimento"],
  ["legalPhone", "Telefone do responsável"],
  ["rootEmail", "Email"],
];

function findInput(id: string): HTMLInputElement | null {
  if (typeof document === "undefined") return null;
  const node = document.getElementById(id);
  return node instanceof HTMLInputElement ? node : null;
}

// Converte a data exibida (dd/mm/aaaa) para ISO (aaaa-mm-dd), que a API espera (LocalDate).
function toIsoDate(value: string): string {
  const trimmed = value.trim();
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (br) {
    return `${br[3]}-${br[2]}-${br[1]}`;
  }
  return trimmed;
}

function buildPayload(form: SignupFormValues): SignupPayload {
  return {
    cnpj: form.cnpj.replace(/\D/g, ""),
    corporateName: form.corporateName.trim(),
    tradeName: form.tradeName.trim(),
    rootEmail: form.rootEmail.trim(),
    plainRootPassword: form.plainRootPassword,
    address: {
      street: form.addressStreet.trim(),
      number: form.addressNumber.trim(),
      complement: form.addressComplement.trim(),
      postalCode: form.addressPostalCode.trim(),
      city: form.addressCity.trim(),
      state: form.addressState.trim().toUpperCase(),
      district: form.addressDistrict.trim(),
      phone: form.addressPhone.trim(),
    },
    legalRepresentative: {
      firstName: form.legalFirstName.trim(),
      lastName: form.legalLastName.trim(),
      cpf: form.legalCpf.replace(/\D/g, ""),
      birthDate: toIsoDate(form.legalBirthDate),
      phone: form.legalPhone.trim(),
      whatsapp: form.legalWhatsapp.trim(),
    },
  };
}

// Le uma string aninhada do JSON da publica.cnpj.ws (ex.: estabelecimento.cidade.nome).
function readLookup(value: unknown, ...path: string[]): string | null {
  let current: unknown = value;
  for (const key of path) {
    if (!current || typeof current !== "object") return null;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" && current.trim() ? current.trim() : null;
}

function joinStreet(type: string | null, street: string | null): string | null {
  const parts = [type, street].filter(Boolean);
  return parts.length ? parts.join(" ") : null;
}

// Indice da etapa "Empresa" (a do CNPJ) no wizard.
const STEP_EMPRESA = 0;

/**
 * Whistle que NAO some sozinho: fica ate' o usuario fechar no "x".
 *
 * O default do SgWhistler e' 5000ms (o manifesto diz "padrao = permanente", mas o codigo faz
 * `whistle.duration ?? 5000`). Some sozinho serve para confirmacao passageira; aqui o aviso e' um
 * bloqueio ("CNPJ ja cadastrado") ou uma pendencia com acao ao lado — sumir enquanto a pessoa le
 * ou preenche o formulario e' perder a informacao junto com o botao que a resolve.
 */
const WHISTLE_PERMANENTE = 0;

// IDs fixos para os whistles poderem ser substituidos/fechados em vez de empilhar.
// O campo de CNPJ usa UM id so: o SgWhistle substitui por id, entao nunca aparecem dois avisos
// concorrentes sobre o mesmo campo.
const CNPJ_WHISTLE_ID = "signup-cnpj-status";
const EMAIL_DELIVERY_WHISTLE_ID = "signup-email-delivery";

/**
 * O que sabemos sobre o CNPJ digitado, vindo das DUAS checagens que o blur dispara: a nossa base
 * (`cnpj-status`) e a consulta publica a Receita (dentro do SgInputCNPJ).
 */
type CnpjNotice = {
  digits: string;
  base: CnpjSignupStatus | null;
  pendingEmail: string | null;
  receitaUnavailable: boolean;
};

function emptyNotice(digits: string): CnpjNotice {
  return { digits, base: null, pendingEmail: null, receitaUnavailable: false };
}

/** Zera o acumulado quando o CNPJ muda, para nao herdar o veredito do numero anterior. */
function noticeFor(ref: { current: CnpjNotice }, digits: string): CnpjNotice {
  if (ref.current.digits !== digits) ref.current = emptyNotice(digits);
  return ref.current;
}

// Aviso de e-mail nao entregue. O cadastro FOI salvo e o codigo continua valido — o que falhou
// foi so o envio. Dizer "verifique a caixa de entrada e o spam" nesse caso manda o usuario
// procurar um e-mail que nunca saiu (foi o que aconteceu quando o provedor ficou sem credito).
function whistleEmailNaoEnviado(contexto: string) {
  sgWhistle.error({
    id: EMAIL_DELIVERY_WHISTLE_ID,
    duration: WHISTLE_PERMANENTE,
    title: "Não conseguimos enviar o e-mail agora",
    message: `${contexto} Tente "Reenviar email" em alguns minutos ou fale com o suporte.`,
  });
}

export function SignupForm({
  onBackToLogin,
  initialStage = "form",
  initialEmail = "",
}: SignupFormProps) {
  // react-hook-form no modo documentado pelo @seedgrid/fe-components: `name` + `register`
  // (inputs nao controlados). Os componentes Sg ja validam sozinhos e renderizam o erro com
  // `data-sg-error`, que e justamente o que o SgWizard inspeciona para liberar o "Proximo" —
  // com o form controlado a mao isso funcionava por acidente; agora e o mecanismo oficial.
  //
  // Por que `register` e nao `control`/Controller: os inputs com mascara (CNPJ, CPF, telefone,
  // CEP) aplicam a mascara mutando `event.target.value` DEPOIS de avisar o RHF. Em modo
  // controlado o React re-renderiza com o valor pre-mascara e a mascara nunca "gruda".
  // Em modo `register` o DOM e a fonte da verdade e o RHF ressincroniza no blur.
  const { register, setValue, getValues, handleSubmit, control } = useForm<SignupFormValues>({
    defaultValues: emptyForm(),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>(initialStage);
  const [confirmToken, setConfirmToken] = useState("");
  const [signupEmail, setSignupEmail] = useState(initialEmail);
  // E-mail ja cadastrado: o cadastro vira VINCULACAO da empresa a conta existente — escondemos a
  // senha (o usuario ja tem a dele) e mostramos um aviso. Detectado no onExit do campo de e-mail.
  const [linkingExisting, setLinkingExisting] = useState(false);
  // CNPJ que ja tem company: nao adianta seguir no wizard, o back recusa no submit.
  const [cnpjRegistered, setCnpjRegistered] = useState(false);

  // Guarda de idempotencia das consultas externas. NAO pode viver dentro do SgInputCNPJ /
  // SgInputPostalCode: o SgWizard renderiza so a pagina atual (`pages[step]`), entao sair e
  // voltar de uma etapa DESMONTA o input e zera o cache interno dele. Aqui, no SignupForm,
  // o ref sobrevive a navegacao entre etapas. Ver comentario em `handleCnpjResult`.
  const appliedCnpjRef = useRef<string | null>(null);
  const appliedCepRef = useRef<string | null>(null);
  // Ultimo CNPJ consultado no cnpj-status. Mesma razao do appliedCnpjRef: o "Proximo" do
  // wizard da focus+blur em todos os inputs, entao sem a guarda cada avanco reconsultava o
  // mesmo CNPJ e reabria o whistle que o usuario tinha acabado de fechar.
  const checkedCnpjRef = useRef<string | null>(null);
  // Acumulado das duas checagens do CNPJ. Elas saem no MESMO blur e resolvem fora de ordem: o
  // `runValidation` do SgInputCNPJ e assincrono e NAO e aguardado antes do onExit, entao ora a
  // nossa base chega primeiro, ora a Receita. Guardar as duas e renderizar sempre a partir do
  // conjunto deixa a mensagem final independente de quem respondeu antes.
  const cnpjNoticeRef = useRef<CnpjNotice>(emptyNotice(""));
  // Consulta de CNPJ em voo, para o "Proximo" do wizard poder esperar por ela.
  const cnpjCheckRef = useRef<Promise<void> | null>(null);

  /**
   * Escreve num campo por codigo (autopreenchimento de CNPJ/CEP).
   *
   * Em modo `register` o input e nao controlado: `setValue` atualiza o estado do RHF e o
   * `value` do elemento, mas nao dispara evento nenhum — a mascara, o rotulo flutuante e a
   * validacao interna do componente Sg continuariam achando que o campo esta vazio. Por isso
   * disparamos um `input` nativo: o React entrega o evento (o value tracker dele ainda tem o
   * valor antigo) e tudo reage como se o usuario tivesse digitado.
   *
   * Se o campo estiver numa etapa ainda nao montada, so o `setValue` acontece — o valor e
   * restaurado no DOM pelo proprio RHF quando aquela etapa montar.
   */
  const applyValue = useCallback(
    (field: SignupField, value: string) => {
      setValue(field, value, { shouldDirty: true, shouldValidate: false });
      const node = findInput(FIELD_ID[field]);
      if (!node) return;
      if (node.value !== value) node.value = value;
      node.dispatchEvent(new Event("input", { bubbles: true }));
    },
    [setValue],
  );

  /**
   * Situacao do CNPJ, consultada ao sair do campo — mesmo padrao do `email-exists`.
   *
   * Sem isto, CNPJ ja cadastrado so aparecia como erro no FIM do wizard, e CNPJ com cadastro
   * PENDENTE nao aparecia de jeito nenhum: quem nao recebia o e-mail refazia o cadastro e
   * duplicava a solicitacao. Vai num whistle, e nao num toast, porque o aviso precisa ficar
   * na tela com a acao ao lado enquanto a pessoa decide o que fazer.
   */
  const renderCnpjNotice = useCallback(() => {
    const notice = cnpjNoticeRef.current;

    // Prioridade: o que a NOSSA base sabe vence o que a Receita respondeu. "Ja tem cadastro" e
    // acionavel e resolve o problema da pessoa; "nao consegui consultar a Receita" vira ruido
    // quando ja sabemos que a empresa existe aqui — e chega a se contradizer, porque a Receita
    // pode nao reconhecer um CNPJ que esta na nossa base (baixado, por exemplo).
    if (notice.base === "REGISTERED") {
      sgWhistle.error({
        id: CNPJ_WHISTLE_ID,
        duration: WHISTLE_PERMANENTE,
        title: "CNPJ já cadastrado",
        message:
          "Esta empresa já possui cadastro. Entre com a conta existente ou recupere a senha.",
        action: { label: "Ir para login", onClick: onBackToLogin },
      });
      return;
    }

    if (notice.base === "PENDING_CONFIRMATION") {
      // NAO bloqueia de proposito: se a solicitacao pendente for de outra pessoa (erro de
      // digitacao no CNPJ, por exemplo), travar aqui deixaria o dono real sem saida. Avisa,
      // oferece o reenvio, e quem decide e o back no submit — mesmo e-mail funde na
      // solicitacao existente, e-mail diferente recebe 409 com a mensagem explicando.
      const mascarado = notice.pendingEmail ? ` (${notice.pendingEmail})` : "";
      sgWhistle.warning({
        id: CNPJ_WHISTLE_ID,
        duration: WHISTLE_PERMANENTE,
        title: "Cadastro aguardando confirmação",
        message:
          `Já existe um cadastro em andamento para este CNPJ${mascarado}, esperando a ` +
          "confirmação por e-mail. Se foi você, peça um código novo em vez de recomeçar.",
        action: {
          label: "Reenviar e-mail de confirmação",
          onClick: () => {
            sgWhistle.dismiss(CNPJ_WHISTLE_ID);
            setStage("confirm");
          },
        },
      });
      return;
    }

    if (notice.receitaUnavailable) {
      sgWhistle.warning({
        id: CNPJ_WHISTLE_ID,
        duration: WHISTLE_PERMANENTE,
        title: "Não confirmamos o CNPJ na Receita",
        message:
          "A consulta pública está indisponível agora, então os dados da empresa não foram " +
          "preenchidos automaticamente. Você pode seguir e digitá-los à mão.",
      });
      return;
    }

    sgWhistle.dismiss(CNPJ_WHISTLE_ID);
  }, [onBackToLogin]);

  /**
   * Situacao do CNPJ na NOSSA base, consultada ao sair do campo — mesmo padrao do `email-exists`.
   *
   * Sem isto, CNPJ ja cadastrado so aparecia como erro no FIM do wizard, e CNPJ com cadastro
   * PENDENTE nao aparecia de jeito nenhum: quem nao recebia o e-mail refazia o cadastro e
   * duplicava a solicitacao. Vai num whistle, e nao num toast, porque o aviso precisa ficar
   * na tela com a acao ao lado enquanto a pessoa decide o que fazer.
   */
  const handleCnpjExit = useCallback(async () => {
    const digits = (findInput(FIELD_ID.cnpj)?.value ?? getValues("cnpj")).replace(/\D/g, "");
    if (digits.length !== 14) return;
    if (checkedCnpjRef.current === digits) return;
    checkedCnpjRef.current = digits;

    try {
      const result = await signupCnpjStatus(digits);
      console.info(`[signup] cnpj-status ${digits} -> ${result.status}`);
      const notice = noticeFor(cnpjNoticeRef, digits);
      notice.base = result.status;
      notice.pendingEmail = result.pendingEmailMasked;
      setCnpjRegistered(result.status === "REGISTERED");
      renderCnpjNotice();
    } catch (err) {
      // Sem este catch a rejeicao morria no `void handleCnpjExit()` — o aviso simplesmente nao
      // aparecia e nao havia rastro de que a checagem tinha falhado. Nao bloqueia o cadastro:
      // se nao deu para consultar, o back ainda decide no submit.
      console.error(`[signup] cnpj-status ${digits} falhou: ${readError(err)}`);
      checkedCnpjRef.current = null; // libera nova tentativa no proximo blur
    }
  }, [getValues, renderCnpjNotice]);

  /**
   * A consulta publica do CNPJ falhou (rate limit da publica.cnpj.ws, instabilidade, rede).
   *
   * Nao e' "CNPJ invalido": o `lookup_cnpj` so' devolve "nao encontrado" no 404 da Receita, e
   * qualquer outra falha chega aqui como erro. Avisa que o autopreenchimento nao veio, sem
   * bloquear — o campo em si nao e' marcado como invalido nesse caminho.
   */
  const handleCnpjLookupError = useCallback(() => {
    const digits = (findInput(FIELD_ID.cnpj)?.value ?? getValues("cnpj")).replace(/\D/g, "");
    if (digits.length !== 14) return;
    noticeFor(cnpjNoticeRef, digits).receitaUnavailable = true;
    renderCnpjNotice();
  }, [getValues, renderCnpjNotice]);

  // Autopreenche os campos da empresa/endereco a partir da consulta de CNPJ.
  // So sobrescreve quando a consulta trouxe valor; mantem o que o usuario ja digitou.
  const handleCnpjResult = useCallback(
    (data: unknown | null) => {
      if (!data) return;
      // O SgInputCNPJ reconsulta a Receita a cada blur quando o cache interno dele foi
      // perdido — e ele e perdido sempre que a etapa 1 do wizard e desmontada/remontada
      // (voltar uma etapa, ou o proprio "Proximo", que da focus+blur em todos os inputs).
      // Sem esta guarda o resultado da consulta era reaplicado e sobrescrevia a razao
      // social / nome fantasia que o usuario tinha acabado de editar, fazendo os nomes
      // ANTIGOS (os da Receita) reaparecerem na revisao e no payload.
      const digits = (
        readLookup(data, "estabelecimento", "cnpj") ??
        findInput(FIELD_ID.cnpj)?.value ??
        getValues("cnpj")
      ).replace(/\D/g, "");
      if (digits && appliedCnpjRef.current === digits) return;
      appliedCnpjRef.current = digits || null;

      const current = getValues();
      const fill = (field: SignupField, next: string | null) => {
        if (next === null) return;
        if (next === current[field]) return;
        applyValue(field, next);
      };

      fill("corporateName", readLookup(data, "razao_social"));
      fill("tradeName", readLookup(data, "estabelecimento", "nome_fantasia"));
      fill(
        "addressStreet",
        joinStreet(
          readLookup(data, "estabelecimento", "tipo_logradouro"),
          readLookup(data, "estabelecimento", "logradouro"),
        ),
      );
      fill("addressNumber", readLookup(data, "estabelecimento", "numero"));
      fill("addressComplement", readLookup(data, "estabelecimento", "complemento"));
      fill("addressDistrict", readLookup(data, "estabelecimento", "bairro"));
      fill("addressPostalCode", readLookup(data, "estabelecimento", "cep"));
      fill("addressCity", readLookup(data, "estabelecimento", "cidade", "nome"));
      fill("addressState", readLookup(data, "estabelecimento", "estado", "sigla"));
    },
    [applyValue, getValues],
  );

  // Autopreenche o endereco a partir da consulta de CEP (ViaCEP, embutida no componente).
  const handleViaCepResult = useCallback(
    (data: ViaCepResponse) => {
      if (data.erro) return;
      // Mesma guarda do CNPJ: o SgInputPostalCode tambem perde o cache dele ao remontar e
      // reemite o resultado do ViaCEP, sobrescrevendo o endereco ja ajustado a mao.
      const key = (data.cep ?? "").replace(/\D/g, "");
      if (key && appliedCepRef.current === key) return;
      appliedCepRef.current = key || null;

      const current = getValues();
      const fill = (field: SignupField, next: string | undefined) => {
        const value = next?.trim();
        if (!value) return;
        if (value === current[field]) return;
        applyValue(field, value);
      };

      fill("addressStreet", data.logradouro);
      fill("addressComplement", data.complemento);
      fill("addressDistrict", data.bairro);
      fill("addressCity", data.localidade);
      fill("addressState", data.uf?.toUpperCase());
    },
    [applyValue, getValues],
  );

  // Checa, ao sair do campo, se o e-mail ja tem conta. Se tiver, o cadastro vira vinculacao.
  async function handleEmailExit() {
    const email = getValues("rootEmail").trim();
    if (!/.+@.+\..+/.test(email)) return;
    try {
      setLinkingExisting(await checkEmailExists(email));
    } catch {
      // silencioso: se a checagem falhar, segue o fluxo normal (o back valida no submit)
    }
  }

  // A senha "atual" precisa vir do DOM enquanto o campo estiver montado: o botao de gerar
  // senha do SgInputPassword escreve direto no input e o RHF so ressincroniza no blur.
  function currentPassword(): string {
    return findInput(FIELD_ID.plainRootPassword)?.value ?? getValues("plainRootPassword");
  }

  function firstMissingRequired(values: SignupFormValues): string | null {
    for (const [field, label] of REQUIRED_FIELDS) {
      if (!values[field]?.trim()) return label;
    }
    if (!linkingExisting && !values.plainRootPassword) return "Senha";
    return null;
  }

  async function submitSignup(values: SignupFormValues) {
    // CNPJ com company: o back recusa com 409 de qualquer jeito. Barra aqui para nao gastar
    // a tentativa (o signup tem rate-limit por IP) nem devolver erro cru no fim do wizard.
    if (cnpjRegistered) {
      setError("Este CNPJ já possui cadastro. Entre com a conta existente ou recupere a senha.");
      return;
    }
    // Em vinculacao a senha esta escondida e e ignorada — nao valida a confirmacao.
    if (!linkingExisting && values.plainRootPassword !== values.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    const missing = firstMissingRequired(values);
    if (missing) {
      setError(`Preencha o campo obrigatório: ${missing}.`);
      return;
    }
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const result = await signUp(buildPayload(values));
      setSignupEmail(values.rootEmail.trim());
      if (result.verificationToken) setConfirmToken(result.verificationToken);
      setStage("confirm");
      if (result.emailDelivered === false) {
        setInfo(null);
        whistleEmailNaoEnviado("Seu cadastro foi salvo, mas o e-mail de confirmação não saiu.");
      } else {
        setInfo(
          linkingExisting
            ? "Enviamos um email de confirmação (verifique a caixa de entrada e o spam). " +
                "Cole o código recebido para confirmar a vinculação desta empresa à sua conta."
            : "Enviamos um email de confirmação (verifique a caixa de entrada e o spam). " +
                "Cole o código recebido para validar. Ao confirmar, você ganha um período de " +
                "avaliação gratuito para testar a geração de relatórios.",
        );
      }
    } catch (err) {
      setError(readError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirm(tokenOverride?: string) {
    // tokenOverride vem do onComplete do SgInputOTP: ao colar o codigo, os 6 slots sao
    // preenchidos de uma vez e onComplete dispara na mesma tick do onRawChange - o estado
    // confirmToken (setState e assincrono) ainda nao foi atualizado nesse momento. Usar o
    // valor recebido diretamente evita mandar um token vazio/desatualizado pro servidor.
    const token = (tokenOverride ?? confirmToken).trim();
    setBusy(true);
    setError(null);
    try {
      await confirmSignupEmail(token);
      setInfo("Email confirmado. Redirecionando para o login...");
      // Mostra a confirmacao por um instante e leva o usuario direto ao login.
      setTimeout(onBackToLogin, 1500);
    } catch (err) {
      setError(readError(err));
      setBusy(false);
    }
  }

  async function handleResend() {
    if (!signupEmail.trim()) {
      setError("Informe o e-mail do cadastro para reenviar a confirmação.");
      return;
    }
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const result = await resendSignupEmail(signupEmail.trim());
      if (result.verificationToken) setConfirmToken(result.verificationToken);
      if (result.emailDelivered === false) {
        whistleEmailNaoEnviado("O código foi renovado, mas o e-mail não saiu.");
      } else {
        sgWhistle.dismiss(EMAIL_DELIVERY_WHISTLE_ID);
        setInfo("Novo email de confirmação enviado. Verifique a caixa de entrada e o spam.");
      }
    } catch (err) {
      setError(readError(err));
    } finally {
      setBusy(false);
    }
  }

  if (stage === "confirm") {
    // Editavel tambem quando chegamos aqui sem e-mail conhecido — e o caso de quem veio pelo
    // whistle de "cadastro aguardando confirmacao" a partir do campo de CNPJ: sem isto a tela
    // pedia para confirmar o cadastro de um e-mail vazio, sem onde digitar.
    const emailEditable = initialStage === "confirm" || !signupEmail.trim();
    return (
      <AuthCard title="Confirmar email">
        {emailEditable ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              Informe o e-mail do cadastro e clique em "Reenviar email" para receber um
              novo código de confirmação.
            </p>
            <SgInputEmail
              id="resend-email"
              label="Email"
              inputProps={{ defaultValue: signupEmail }}
              onChange={(value) => setSignupEmail(value)}
            />
          </>
        ) : (
          <p className="mb-4 text-sm text-muted-foreground">
            Confirme o cadastro de <strong className="text-foreground">{signupEmail}</strong>.
          </p>
        )}
        <SgInputOTP
          id="signup-token"
          label="Código de confirmação"
          hintText="Digite o código de 6 dígitos enviado por e-mail"
          mask="999-999"
          inputProps={{ inputMode: "numeric" }}
          onRawChange={(raw) => setConfirmToken(raw)}
          onComplete={(value) => void handleConfirm(value.replace(/\D/g, ""))}
        />
        <SgButton
          severity="primary"
          appearance="solid"
          loading={busy}
          disabled={confirmToken.length !== 6}
          onClick={() => void handleConfirm()}
          className="mt-3 w-full"
        >
          Confirmar
        </SgButton>
        <div className="mt-3 flex justify-between">
          <SgButton severity="primary" appearance="ghost" onClick={() => void handleResend()}>
            Reenviar email
          </SgButton>
          <SgButton severity="primary" appearance="ghost" onClick={onBackToLogin}>
            Ir para login
          </SgButton>
        </div>
        {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
        {info ? <AuthMessage tone="muted">{info}</AuthMessage> : null}
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Criar conta">
      <SgWizard
        stepper="icons"
        // A checagem do CNPJ e assincrona e comeca no blur do campo — o mesmo blur que o clique
        // em "Proximo" provoca. Sem esperar por ela aqui, dava para avancar antes de o aviso
        // aparecer e preencher o wizard inteiro com um CNPJ que ja tem cadastro. Aguarda a
        // consulta em voo e decide pelo ref (nao pelo state `cnpjRegistered`, que estaria
        // congelado no valor de quando este callback foi criado).
        // Bloqueio declarativo: enquanto a nossa base disser que o CNPJ ja tem cadastro, o
        // "Proximo" fica desabilitado de verdade, em vez de parecer clicavel e nao fazer nada.
        // So' importa na etapa Empresa — com ele ligado nao ha como chegar as seguintes.
        nextDisabled={cnpjRegistered}
        onBeforeNext={async (index) => {
          if (index !== STEP_EMPRESA) return true;
          await cnpjCheckRef.current;
          return cnpjNoticeRef.current.base !== "REGISTERED";
        }}
        labels={{
          previous: "Voltar",
          next: "Próximo",
          finish: busy ? "Enviando..." : "Criar conta",
        }}
        onFinish={handleSubmit(submitSignup, () =>
          setError("Revise os campos destacados antes de criar a conta."),
        )}
      >
        <SgWizardPage title="Empresa" icon={<Building2 className="size-5" />}>
          <SgStack gap={12}>
            <SgInputCNPJ
              id={FIELD_ID.cnpj}
              name="cnpj"
              register={register}
              label="CNPJ"
              required
              validateOnBlur
              // Marca o campo em vermelho enquanto o CNPJ tiver cadastro, no padrao do resto do
              // formulario. Quem desabilita o "Proximo" e' o `nextDisabled` do SgWizard, la em
              // cima; aqui fica so' a explicacao do motivo. O `error` externo vence o interno no
              // resolveFieldError, entao esta mensagem se sobrepoe a da consulta a Receita —
              // mesma prioridade do whistle: o que a nossa base sabe vale mais.
              error={cnpjRegistered ? "Este CNPJ já possui cadastro." : undefined}
              validateWithPublicaCnpj
              publicaCnpjFetch={lookupCnpj}
              // Depois do fix no lookup_cnpj, "nao encontrado" significa exatamente 404 da
              // Receita — nao mais "a consulta falhou". A mensagem default ("CNPJ invalido")
              // mandava o usuario conferir o que digitou, e ainda CONTRADIZIA o whistle quando o
              // CNPJ existe aqui mas nao na Receita (empresa baixada, por exemplo): o campo dizia
              // invalido e o aviso dizia ja cadastrado. Dita assim, as duas frases convivem.
              publicaCnpjErrorMessage="CNPJ não encontrado na Receita Federal."
              onPublicaCnpjResult={handleCnpjResult}
              // Falha na consulta a Receita (rate limit, instabilidade) NAO reprova o campo:
              // vira aviso. Sem isto, um 429 da publica.cnpj.ws marcava "CNPJ invalido".
              onPublicaCnpjError={handleCnpjLookupError}
              // Consulta a situacao do CNPJ na nossa base (ja cadastrado / pendente) ao sair
              // do campo — independente da consulta a Receita, que pode nem retornar.
              // Guarda a promessa (e nao so' dispara): o `onBeforeNext` do wizard espera por ela
              // antes de deixar avancar. O corpo do handler roda ate' o primeiro await de forma
              // sincrona, entao a ref ja esta preenchida quando o clique no botao e processado.
              onExit={() => {
                cnpjCheckRef.current = handleCnpjExit();
              }}
              // Sem reset da guarda no onChange de proposito: depois que a consulta joga os
              // dados nos campos, quem vale e o que esta NOS CAMPOS. Trocar o CNPJ ja reabre
              // a escrita sozinho, porque `handleCnpjResult` compara os digitos do resultado
              // com os da ultima aplicacao. Zerar a guarda a cada tecla fazia redigitar o
              // MESMO CNPJ sobrescrever a razao social / nome fantasia editados a mao.
            />
            <SgInputText
              id={FIELD_ID.corporateName}
              name="corporateName"
              register={register}
              label="Razão social"
              required
              validateOnBlur
              minLength={2}
              maxLength={150}
            />
            <SgInputText
              id={FIELD_ID.tradeName}
              name="tradeName"
              register={register}
              label="Nome fantasia"
              required
              validateOnBlur
              // Nome fantasia costuma ser UMA palavra ("Ambev", "Natura") — nao ha
              // exigencia de numero minimo de palavras aqui (nada de minNumberOfWords).
              // A validacao e apenas: obrigatorio e com tamanho razoavel.
              minLength={2}
              maxLength={120}
            />
            <SgInputPhone
              id={FIELD_ID.addressPhone}
              name="addressPhone"
              register={register}
              label="Telefone"
              required
              validateOnBlur
            />
          </SgStack>
        </SgWizardPage>

        <SgWizardPage title="Endereço" icon={<MapPinned className="size-5" />}>
          <SgStack gap={12}>
            <SgInputPostalCode
              id={FIELD_ID.addressPostalCode}
              name="addressPostalCode"
              register={register}
              label="CEP"
              required
              validateOnBlur
              validateWithViaCep
              onViaCepResult={handleViaCepResult}
              // Mudou o CEP: limpa UF/Cidade (read-only, preenchidos so pelo CEP) enquanto o
              // novo nao resolve. So quando os digitos REALMENTE mudam — redigitar o mesmo
              // CEP nao pode reabrir a porta pro ViaCEP sobrescrever logradouro/complemento/
              // bairro que o usuario ajustou a mao. A guarda em `handleViaCepResult` compara
              // o cep do resultado, entao um CEP novo se reaplica sem precisar de reset.
              onChange={(value) => {
                const digits = value.replace(/\D/g, "");
                if (!appliedCepRef.current || digits === appliedCepRef.current) return;
                applyValue("addressCity", "");
                applyValue("addressState", "");
              }}
            />
            <SgGrid minItemWidth={180} gap={12}>
              <SgInputText
                id={FIELD_ID.addressStreet}
                name="addressStreet"
                register={register}
                label="Logradouro"
                required
                validateOnBlur
              />
              <SgInputText
                id={FIELD_ID.addressNumber}
                name="addressNumber"
                register={register}
                label="Número"
                required
                validateOnBlur
              />
            </SgGrid>
            <SgInputText
              id={FIELD_ID.addressComplement}
              name="addressComplement"
              register={register}
              label="Complemento"
            />
            <SgInputText
              id={FIELD_ID.addressDistrict}
              name="addressDistrict"
              register={register}
              label="Bairro"
              required
              validateOnBlur
            />
            <SgGrid minItemWidth={180} gap={12}>
              <SgInputText
                id={FIELD_ID.addressCity}
                name="addressCity"
                register={register}
                label="Cidade"
                required
                enabled={false}
                validateOnBlur
              />
              <SgInputText
                id={FIELD_ID.addressState}
                name="addressState"
                register={register}
                label="UF"
                required
                enabled={false}
                validateOnBlur
                maxLength={2}
              />
            </SgGrid>
          </SgStack>
        </SgWizardPage>

        <SgWizardPage title="Responsável" icon={<ShieldCheck className="size-5" />}>
          <SgStack gap={12}>
            <SgGrid minItemWidth={180} gap={12}>
              <SgInputText
                id={FIELD_ID.legalFirstName}
                name="legalFirstName"
                register={register}
                label="Nome"
                required
                validateOnBlur
              />
              <SgInputText
                id={FIELD_ID.legalLastName}
                name="legalLastName"
                register={register}
                label="Sobrenome"
                required
                validateOnBlur
              />
            </SgGrid>
            <SgGrid minItemWidth={180} gap={12}>
              <SgInputCPF
                id={FIELD_ID.legalCpf}
                name="legalCpf"
                register={register}
                label="CPF"
                required
                validateOnBlur
              />
              <SgInputBirthDate
                id={FIELD_ID.legalBirthDate}
                name="legalBirthDate"
                register={register}
                label="Nascimento"
                required
                minAge={18}
                validateOnBlur
              />
            </SgGrid>
            <SgGrid minItemWidth={180} gap={12}>
              <SgInputPhone
                id={FIELD_ID.legalPhone}
                name="legalPhone"
                register={register}
                label="Telefone"
                required
                validateOnBlur
              />
              <SgInputPhone
                id={FIELD_ID.legalWhatsapp}
                name="legalWhatsapp"
                register={register}
                label="WhatsApp"
                validateOnBlur
              />
            </SgGrid>
            <SgInputEmail
              id={FIELD_ID.rootEmail}
              name="rootEmail"
              register={register}
              label="Email"
              required
              validateOnBlur
              onExit={() => void handleEmailExit()}
              // Mudou o e-mail: re-avalia a vinculacao no proximo onExit.
              onChange={() => setLinkingExisting((current) => (current ? false : current))}
            />
            {linkingExisting ? (
              <AuthMessage tone="muted">
                Este e-mail já tem uma conta. Esta empresa será <strong>vinculada</strong> à sua
                conta existente — você entra com a senha que já usa. Enviaremos um e-mail para
                confirmar a vinculação.
              </AuthMessage>
            ) : (
              <SgGrid minItemWidth={180} gap={12}>
                <SgInputPassword
                  id={FIELD_ID.plainRootPassword}
                  name="plainRootPassword"
                  register={register}
                  label="Senha"
                  required
                  maxLength={128}
                  minSize={8}
                  prohibitsRepeatedCharactersInSequence={false}
                  showStrengthBar
                  createNewPasswordButton
                />
                <SgInputPassword
                  id={FIELD_ID.confirmPassword}
                  name="confirmPassword"
                  register={register}
                  label="Confirmar senha"
                  required
                  maxLength={128}
                  // Campo so de CONFIRMACAO: sem barra de forca e sem politica de senha (a politica
                  // ja e cobrada no campo "Senha"). Aqui a unica regra e coincidir com a 1a senha.
                  showStrengthBar={false}
                  commonPasswordCheck={false}
                  upperRequired={false}
                  lowerRequired={false}
                  numberRequired={false}
                  specialCharacterRequired={false}
                  prohibitsRepeatedCharactersInSequence={false}
                  prohibitsSequentialAscCharacters={false}
                  prohibitsSequentialDescCharacters={false}
                  minSize={0}
                  validation={(value) =>
                    value === currentPassword() ? null : "As senhas não coincidem"
                  }
                />
              </SgGrid>
            )}
          </SgStack>
        </SgWizardPage>

        <SgWizardPage title="Revisão" icon={<Rocket className="size-5" />}>
          <ReviewSummary control={control} />
        </SgWizardPage>
      </SgWizard>
      <div className="mt-4 flex justify-center">
        <SgButton severity="primary" appearance="ghost" onClick={onBackToLogin}>
          Já tenho conta
        </SgButton>
      </div>
      {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
      {info ? <AuthMessage tone="muted">{info}</AuthMessage> : null}
    </AuthCard>
  );
}

/**
 * Resumo da ultima etapa.
 *
 * Le os valores por `useWatch` (e nao por `getValues()` no corpo do SignupForm) de proposito:
 * o SgWizard renderiza `pages[step]`, elementos criados na ULTIMA renderizacao do SignupForm.
 * Como os inputs sao nao controlados, digitar nao re-renderiza o SignupForm — um `getValues()`
 * ali em cima congelaria o resumo nos valores de antes da edicao. O `useWatch` roda dentro
 * deste componente, que so monta na etapa de revisao, e reage a cada mudanca do form.
 */
function ReviewSummary({ control }: { readonly control: Control<SignupFormValues> }) {
  const values = useWatch({ control });
  const text = (value: string | undefined) => value ?? "";
  return (
    <SgStack gap={6} className="text-sm">
      <ReviewRow label="CNPJ" value={text(values.cnpj)} />
      <ReviewRow label="Razão social" value={text(values.corporateName)} />
      <ReviewRow label="Nome fantasia" value={text(values.tradeName)} />
      <ReviewRow
        label="Endereço"
        value={`${text(values.addressStreet)}, ${text(values.addressNumber)} - ${text(
          values.addressDistrict,
        )}, ${text(values.addressCity)}/${text(values.addressState)}`}
      />
      <ReviewRow
        label="Responsável"
        value={`${text(values.legalFirstName)} ${text(values.legalLastName)}`}
      />
      <ReviewRow label="Email" value={text(values.rootEmail)} />
    </SgStack>
  );
}

function ReviewRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/50 py-1 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{value || "—"}</span>
    </div>
  );
}
