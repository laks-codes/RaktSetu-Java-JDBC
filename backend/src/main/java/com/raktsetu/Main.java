package com.raktsetu;

import com.raktsetu.config.Database;
import com.raktsetu.controller.ApiController;
import com.raktsetu.dao.JdbcUserDao;
import com.raktsetu.service.AuthService;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;

/** Starts the built-in Java HTTP server and registers the API route handler. */
public class Main {
    public static void main(String[] args) throws Exception {
        int port = 8080;
        String configuredPort = System.getenv("SERVER_PORT");
        if (configuredPort != null && !configuredPort.isEmpty()) port = Integer.parseInt(configuredPort);
        Database database = new Database();
        AuthService authService = new AuthService(new JdbcUserDao(database));
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api/v1", new ApiController(database, authService));
        server.setExecutor(null);
        server.start();
        System.out.println("RaktSetu Java API listening on port " + port);
    }
}
