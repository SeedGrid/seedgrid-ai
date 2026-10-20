# syntax=docker/dockerfile:1
# Modelo de publicacao do servico {{nome}} ({{slug}}). Preenchido por render.mjs a partir do produto.json.
# Baseado no Dockerfile do backend do boilerplate login-tenancy (origin/main): build multi-stage
# Maven + Temurin 21, layout fast-jar do Quarkus, runtime Alpine com usuario nao-root.
# Diferenca: a porta vem do produto.json (quarkus.http.port via QUARKUS_HTTP_PORT).

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml ./
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -q -DskipTests dependency:go-offline
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -q -DskipTests clean package

FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app
LABEL org.opencontainers.image.title="{{slug}}-{{nome}}" \
      org.opencontainers.image.url="https://{{dominio}}"

# CalVer+sha calculado no workflow de publicacao; "dev" fora do pipeline.
ARG VERSION=dev
ENV APP_VERSION=$VERSION

RUN addgroup -S app && adduser -S app -G app

COPY --from=build /build/target/quarkus-app/lib/     ./lib/
COPY --from=build /build/target/quarkus-app/*.jar    ./
COPY --from=build /build/target/quarkus-app/app/     ./app/
COPY --from=build /build/target/quarkus-app/quarkus/ ./quarkus/

USER app
EXPOSE {{porta}}
ENV LANG=C.UTF-8 \
    QUARKUS_HTTP_PORT={{porta}} \
    QUARKUS_HTTP_HOST=0.0.0.0 \
    JAVA_OPTS="-XX:MaxRAMPercentage=75 -Djava.util.logging.manager=org.jboss.logmanager.LogManager -Dvertx.disableDnsResolver=true"
CMD ["sh", "-c", "exec java $JAVA_OPTS -jar quarkus-run.jar"]
