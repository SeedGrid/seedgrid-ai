
  publicar-{{nome}}:
    needs: versao
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: {{registryHost}}
          username: ${{ secrets.REGISTRY_USERNAME }}
          password: ${{ secrets.REGISTRY_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          context: ./{{nome}}
          file: ./{{nome}}/Dockerfile
          push: true
          build-args: VERSION=${{ needs.versao.outputs.versao }}
          tags: |
            ${{ env.REGISTRY }}/{{slug}}-{{nome}}:${{ needs.versao.outputs.versao }}
            ${{ env.REGISTRY }}/{{slug}}-{{nome}}:latest
          cache-from: type=gha,scope={{nome}}
          cache-to: type=gha,mode=max,scope={{nome}}
      - name: Deploy no EasyPanel ({{nome}}, porta {{porta}})
        run: curl --fail --silent --show-error -X POST "${{ secrets.EASYPANEL_WEBHOOK_{{nomeUpper}} }}"
