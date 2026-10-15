# ---------- Stage 1: build the executable JAR (so you do not need Maven installed to run Docker)
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml .
COPY database database
RUN mvn -q -B -DskipTests dependency:go-offline
COPY src src
RUN mvn -q -B -DskipTests package

# ---------- Stage 2: the runtime image - the five standard instructions from the experiment
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/target/opportunex-api-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
