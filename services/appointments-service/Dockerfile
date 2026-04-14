# Appointments Service Dockerfile
# Java 17 + Maven build

# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Configure Maven with retry settings
RUN echo '<?xml version="1.0" encoding="UTF-8"?><settings xmlns="http://maven.apache.org/SETTINGS/1.2.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.2.0 https://maven.apache.org/xsd/settings-1.2.0.xsd"><profiles><profile><id>default</id><repositories><repository><id>central</id><url>https://repo.maven.apache.org/maven2</url><releases><enabled>true</enabled></releases><snapshots><enabled>false</enabled></snapshots></repository></repositories><pluginRepositories><pluginRepository><id>central</id><url>https://repo.maven.apache.org/maven2</url></pluginRepository></pluginRepositories></profile></profiles><activeProfiles><activeProfile>default</activeProfile></activeProfiles></settings>' > /usr/share/maven/conf/settings.xml && \
    mvn clean package -DskipTests -B -Dmaven.resolver.transport=wagon -Dmaven.download.retry.count=5

# Stage 2: Runtime
FROM eclipse-temurin:17-jre

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl

WORKDIR /app

# Create non-root user
RUN groupadd -r appointments && \
    useradd -r -g appointments -m appointments

# Copy jar from builder
COPY --from=builder /app/target/appointments-service-*.jar app.jar

# Set ownership
RUN chown -R appointments:appointments /app

USER appointments

# Expose port
EXPOSE 8085

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8085/actuator/health || exit 1

# Run application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
