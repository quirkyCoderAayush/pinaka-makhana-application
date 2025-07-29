package com.pinaka.makhana.config;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Validates and fixes database schema issues on application startup
 */
@Component
@Order(1) // Run before other CommandLineRunners
public class DatabaseSchemaValidator implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSchemaValidator.class);
    
    private final DataSource dataSource;

    public DatabaseSchemaValidator(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) throws Exception {
        validateAndFixSchema();
    }

    private void validateAndFixSchema() {
        try (Connection connection = dataSource.getConnection()) {
            logger.info("🔍 Validating database schema...");
            
            // Check if product table exists
            if (!tableExists(connection, "product")) {
                logger.warn("⚠️ Product table does not exist. It will be created by Hibernate.");
                return;
            }
            
            // Check image_url column length
            int imageUrlLength = getColumnLength(connection, "product", "image_url");
            logger.info("📏 Current image_url column length: {}", imageUrlLength);
            
            if (imageUrlLength < 1000) {
                logger.warn("⚠️ image_url column length is {} (should be 1000). Attempting to fix...", imageUrlLength);
                fixImageUrlColumn(connection);
            } else {
                logger.info("✅ image_url column length is correct: {}", imageUrlLength);
            }
            
            // Check meta_title column length
            int metaTitleLength = getColumnLength(connection, "product", "meta_title");
            if (metaTitleLength > 0 && metaTitleLength < 500) {
                logger.warn("⚠️ meta_title column length is {} (should be 500). Attempting to fix...", metaTitleLength);
                fixMetaTitleColumn(connection);
            }
            
            // Check meta_description column length
            int metaDescLength = getColumnLength(connection, "product", "meta_description");
            if (metaDescLength > 0 && metaDescLength < 1000) {
                logger.warn("⚠️ meta_description column length is {} (should be 1000). Attempting to fix...", metaDescLength);
                fixMetaDescriptionColumn(connection);
            }
            
            logger.info("✅ Database schema validation completed successfully!");
            
        } catch (Exception e) {
            logger.error("❌ Error during database schema validation", e);
            // Don't throw exception to prevent application startup failure
        }
    }

    private boolean tableExists(Connection connection, String tableName) throws Exception {
        DatabaseMetaData metaData = connection.getMetaData();
        try (ResultSet tables = metaData.getTables(null, null, tableName, new String[]{"TABLE"})) {
            return tables.next();
        }
    }

    private int getColumnLength(Connection connection, String tableName, String columnName) throws Exception {
        DatabaseMetaData metaData = connection.getMetaData();
        try (ResultSet columns = metaData.getColumns(null, null, tableName, columnName)) {
            if (columns.next()) {
                return columns.getInt("COLUMN_SIZE");
            }
        }
        return 0;
    }

    private void fixImageUrlColumn(Connection connection) {
        try (Statement statement = connection.createStatement()) {
            String sql = "ALTER TABLE product MODIFY COLUMN image_url VARCHAR(1000)";
            statement.executeUpdate(sql);
            logger.info("✅ Fixed image_url column length to 1000");
        } catch (Exception e) {
            logger.error("❌ Failed to fix image_url column", e);
        }
    }

    private void fixMetaTitleColumn(Connection connection) {
        try (Statement statement = connection.createStatement()) {
            String sql = "ALTER TABLE product MODIFY COLUMN meta_title VARCHAR(500)";
            statement.executeUpdate(sql);
            logger.info("✅ Fixed meta_title column length to 500");
        } catch (Exception e) {
            logger.error("❌ Failed to fix meta_title column", e);
        }
    }

    private void fixMetaDescriptionColumn(Connection connection) {
        try (Statement statement = connection.createStatement()) {
            String sql = "ALTER TABLE product MODIFY COLUMN meta_description VARCHAR(1000)";
            statement.executeUpdate(sql);
            logger.info("✅ Fixed meta_description column length to 1000");
        } catch (Exception e) {
            logger.error("❌ Failed to fix meta_description column", e);
        }
    }
}
