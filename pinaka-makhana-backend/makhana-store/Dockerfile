# Pinaka Makhana Backend - Dockerfile for Render Deployment
FROM eclipse-temurin:17-jdk AS build

# Install Maven
RUN apt-get update && apt-get install -y maven

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

# Set working directory
WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/target/makhana-store-0.0.1-SNAPSHOT.jar app.jar

# Create uploads directory
RUN mkdir -p /tmp/uploads/images

# Expose port
EXPOSE 10000

# Run the application
CMD ["java", "-jar", "app.jar"]
