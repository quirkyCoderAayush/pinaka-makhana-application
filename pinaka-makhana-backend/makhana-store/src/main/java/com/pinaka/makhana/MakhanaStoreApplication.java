package com.pinaka.makhana;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MakhanaStoreApplication {

	public static void main(String[] args) {
		System.out.println("🚀 Starting Pinaka Makhana Backend Application...");
		System.out.println("📊 Server Port: " + System.getenv("SERVER_PORT"));
		System.out.println("🗄️ Database URL: " + (System.getenv("DATABASE_URL") != null ? "Configured" : "Not configured"));

		SpringApplication.run(MakhanaStoreApplication.class, args);

		System.out.println("✅ Pinaka Makhana Backend started successfully!");
		System.out.println("🏥 Health check available at: /api/health");
		System.out.println("Hello quirkyCoder, all looks good here and perfect!!!");
	}

}
