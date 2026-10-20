# Atalhos de quem desenvolve o seedgrid-ai (nao faz parte do pacote publicado).
# Requer "make"; sem ele, rode os comandos npm equivalentes.
.PHONY: sync publicar

sync: ## copia os boilerplates do origin/main do repositorio boilerplate
	npm run sync-boilerplates

publicar: sync ## sincroniza, testa e mostra o que falta comitar (nao faz commit, push nem publish)
	npm test
	git status --short
	@echo "Revise, comite e so entao publique (push/tag/publish dependem de autorizacao do dono)."
