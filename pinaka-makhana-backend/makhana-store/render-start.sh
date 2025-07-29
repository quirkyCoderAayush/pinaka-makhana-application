#!/bin/bash
echo "🚀 Starting Pinaka Makhana Backend..."

echo "☕ Setting JAVA_HOME..."
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

echo "📋 Environment Variables:"
echo "DATABASE_URL: ${DATABASE_URL}"
echo "SERVER_PORT: ${SERVER_PORT}"

echo "🎯 Starting Spring Boot application..."
java -jar target/makhana-store-0.0.1-SNAPSHOT.jar
