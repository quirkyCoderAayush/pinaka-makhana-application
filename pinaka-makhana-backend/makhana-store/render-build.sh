#!/bin/bash
echo "🚀 Installing Java 17 and Maven..."
apt-get update -y
apt-get install -y openjdk-17-jdk maven

echo "☕ Setting JAVA_HOME..."
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

echo "🔨 Building Spring Boot application..."
mvn clean package -DskipTests

echo "✅ Build completed!"
ls -la target/
