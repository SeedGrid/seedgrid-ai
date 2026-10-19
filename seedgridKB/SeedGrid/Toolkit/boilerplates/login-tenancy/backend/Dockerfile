# syntax=docker/dockerfile:1

# ------------------------------------------------------------------
# Stage 1 — build (fast-jar). As libs br.com.seedgrid.* resolvem do
# Maven Central; nenhum secret/repo extra é necessário aqui.
# ------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# resolve dependências primeiro (camada cacheável enquanto o pom não muda)
COPY pom.xml ./
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -q -DskipTests dependency:go-offline

# código + empacotamento
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -q -DskipTests clean package

# ------------------------------------------------------------------
# Stage 2 — runtime (Alpine + JRE 21). Só o layout do fast-jar.
# ------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# CalVer+sha calculado no deploy.yml (ex.: 2026.07.28-b42bbe3); "dev" fora do pipeline.
# Repassado como env pra app logar no boot (StartupBannerLogger) qual build subiu de fato.
ARG VERSION=dev
ENV APP_VERSION=$VERSION

RUN addgroup -S app && adduser -S app -G app

# ordem importa p/ cache: lib (raro muda) -> jar -> app/quarkus (código)
COPY --from=build /build/target/quarkus-app/lib/     ./lib/
COPY --from=build /build/target/quarkus-app/*.jar    ./
COPY --from=build /build/target/quarkus-app/app/     ./app/
COPY --from=build /build/target/quarkus-app/quarkus/ ./quarkus/

USER app
EXPOSE 8080
ENV LANG=C.UTF-8 \
    JAVA_OPTS="-XX:MaxRAMPercentage=75 -Djava.util.logging.manager=org.jboss.logmanager.LogManager -Dvertx.disableDnsResolver=true"
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar quarkus-run.jar"]
