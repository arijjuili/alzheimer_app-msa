# Memory Service Dockerfile
# Java 17 + Maven build

# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

COPY pom.xml .
COPY settings-docker.xml /usr/share/maven/conf/settings.xml

COPY src ./src

# Retry download up to 3 times with delays
RUN for i in 1 2 3; do \
    mvn dependency:go-offline -B && break || \
    (echo "Retry $i failed, waiting 30s..." && sleep 30); \
    done

RUN for i in 1 2 3; do \
    mvn clean package -DskipTests -B && break || \
    (echo "Retry $i failed, waiting 30s..." && sleep 30); \
    done

# Stage 2: Runtime
FROM eclipse-temurin:17-jre

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN groupadd -r -g 1001 memory && \
    useradd -r -u 1001 -g memory memory

COPY --from=builder /app/target/memory-service-*.jar app.jar

RUN chown -R memory:memory /app

USER memory

EXPOSE 8086

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8086/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
