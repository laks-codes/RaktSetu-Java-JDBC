package com.raktsetu.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/** Opens a MySQL connection using environment variables. */
public class Database {
    private final String url;
    private final String user;
    private final String password;

    public Database() {
        String host = value("MYSQL_HOST", "localhost");
        String port = value("MYSQL_PORT", "3306");
        String name = value("MYSQL_DATABASE", "raktsetu_db");
        url = "jdbc:mysql://" + host + ":" + port + "/" + name + "?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        user = value("MYSQL_USER", "raktsetu_user");
        password = value("MYSQL_PASSWORD", "raktsetu_secret");
    }

    private String value(String key, String fallback) {
        String configured = System.getenv(key);
        return configured == null || configured.isEmpty() ? fallback : configured;
    }

    public Connection connect() throws SQLException {
        return DriverManager.getConnection(url, user, password);
    }
}
