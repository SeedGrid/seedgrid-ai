// Gancho da tela de configuracao propria do produto (P180.F2.T18, FE-45). O boilerplate nao tem tela de
// configuracao; um produto que tem (como o Display) aponta o caminho dela aqui e a entrada "Configuracoes" aparece
// no menu do usuario (sgUserMenu), junto de Meu perfil, Minha assinatura e Sair. Ela NAO vai para o menu lateral.
// null = o produto nao tem tela propria e o menu do usuario fica como esta.
export const PRODUCT_SETTINGS_PATH: string | null = null;

export const PRODUCT_SETTINGS_LABEL = "Configurações";
