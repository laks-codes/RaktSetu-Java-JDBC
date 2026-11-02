import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.lang.reflect.Type;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.HashMap;
import java.util.Map;

/** Handles login, donor search, and blood request HTTP calls. */
public class ApiController implements HttpHandler {
    private final Database database;
    private final AuthService auth;
    private final BloodService blood;
    private final Gson gson = new Gson();
    private final Type jsonObjectType = new TypeToken<Map<String, Object>>() {}.getType();

    public ApiController(Database database, AuthService auth) {
        this.database = database;
        this.auth = auth;
        this.blood = new BloodService(database);
    }

    public void handle(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        addCorsHeaders(exchange);

        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            send(exchange, 204, "");
            return;
        }

        try {
            Object result = route(exchange);
            int status = "POST".equals(exchange.getRequestMethod())
                    && !path.equals("/api/v1/auth/login") ? 201 : 200;
            send(exchange, status, gson.toJson(result));
        } catch (ApiException e) {
            send(exchange, e.status, error(e.status, e.getMessage(), path));
        } catch (IllegalArgumentException e) {
            send(exchange, 400, error(400, e.getMessage(), path));
        } catch (java.sql.SQLIntegrityConstraintViolationException e) {
            send(exchange, 409, error(409, "A record already exists", path));
        } catch (Exception e) {
            e.printStackTrace();
            send(exchange, 500, error(500, "Internal server error", path));
        }
    }

    private Object route(HttpExchange exchange) throws Exception {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();
        Map<String, Object> body = readBody(exchange);

        if (path.equals("/api/v1/auth/register") && method.equals("POST")) {
            return register(body);
        }
        if (path.equals("/api/v1/auth/login") && method.equals("POST")) {
            return login(body);
        }
        if (path.equals("/api/v1/auth/me") && method.equals("GET")) {
            return userDetails(requireUser(exchange));
        }
        if (path.equals("/api/v1/donors") && method.equals("GET")) {
            requireUser(exchange);
            return blood.searchDonors(readQuery(exchange));
        }
        if (path.equals("/api/v1/requests") && method.equals("POST")) {
            return blood.createRequest(requireUser(exchange), body);
        }

        throw new ApiException(404, "Endpoint not found");
    }

    private Object register(Map<String, Object> body) throws Exception {
        User user = new User();
        user.setEmail(required(body, "email"));
        user.setFullName(required(body, "fullName"));
        user.setPhoneNumber(required(body, "phoneNumber"));
        user.setCity(required(body, "city"));

        String role = value(body, "role", "ROLE_REQUESTER");
        if (!role.equals("ROLE_DONOR") && !role.equals("ROLE_REQUESTER")) {
            throw new ApiException(400, "Choose donor or requester account type");
        }
        user.setRole(role);
        user.setStatus("ACTIVE");

        String password = required(body, "password");
        long userId = auth.createUser(user, password);
        user.setId(userId);
        user = auth.findById(userId);

        if ("ROLE_DONOR".equals(role)) {
            createDonorProfile(userId, user.getCity(), body);
            user = auth.findById(userId);
        }

        return authResponse(user);
    }

    private void createDonorProfile(long userId, String city, Map<String, Object> body) throws Exception {
        String bloodGroup = databaseBlood(required(body, "bloodGroup"));
        boolean shareContact = booleanValue(body, "consentToContact", false);
        String sql = "INSERT INTO donor_profiles(user_id,blood_group,city,consent_to_contact) VALUES(?,?,?,?)";

        try (Connection connection = database.connect();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, userId);
            statement.setString(2, bloodGroup);
            statement.setString(3, city);
            statement.setBoolean(4, shareContact);
            statement.executeUpdate();
        }
    }

    private Object login(Map<String, Object> body) throws Exception {
        String email = required(body, "email");
        String password = required(body, "password");
        User user = auth.findByEmail(email);

        if (user == null || !auth.passwordMatches(password, user.getPasswordHash())) {
            throw new ApiException(401, "Invalid email or password");
        }
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new ApiException(403, "Account is not active");
        }

        return authResponse(user);
    }

    private Object authResponse(User user) throws Exception {
        Map<String, Object> response = new HashMap<String, Object>();
        response.put("token", auth.issueToken(user));
        response.put("type", "Bearer");
        response.put("user", userDetails(user));
        return response;
    }

    private Map<String, Object> userDetails(User user) {
        Map<String, Object> details = new HashMap<String, Object>();
        details.put("id", user.getId());
        details.put("email", user.getEmail());
        details.put("fullName", user.getFullName());
        details.put("phoneNumber", user.getPhoneNumber());
        details.put("city", user.getCity());
        details.put("role", user.getRole());
        details.put("status", user.getStatus());
        details.put("createdAt", user.getCreatedAt());
        return details;
    }

    private User requireUser(HttpExchange exchange) throws Exception {
        String header = exchange.getRequestHeaders().getFirst("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new ApiException(401, "Please sign in first");
        }
        long userId = auth.tokenUserId(header.substring(7));
        User user = auth.findById(userId);
        if (user == null || !"ACTIVE".equals(user.getStatus())) {
            throw new ApiException(401, "Please sign in first");
        }
        return user;
    }

    private Map<String, Object> readBody(HttpExchange exchange) throws IOException {
        byte[] bytes = exchange.getRequestBody().readAllBytes();
        if (bytes.length == 0) {
            return new HashMap<String, Object>();
        }
        Map<String, Object> body = gson.fromJson(new String(bytes, StandardCharsets.UTF_8), jsonObjectType);
        return body == null ? new HashMap<String, Object>() : body;
    }

    private Map<String, String> readQuery(HttpExchange exchange) {
        Map<String, String> query = new HashMap<String, String>();
        String rawQuery = exchange.getRequestURI().getRawQuery();
        if (rawQuery == null) {
            return query;
        }
        for (String part : rawQuery.split("&")) {
            String[] pair = part.split("=", 2);
            query.put(decode(pair[0]), pair.length == 2 ? decode(pair[1]) : "");
        }
        return query;
    }

    private String required(Map<String, Object> values, String key) {
        String value = stringValue(values, key);
        if (value == null || value.trim().isEmpty()) {
            throw new ApiException(400, key + " is required");
        }
        return value.trim();
    }

    private String stringValue(Map<String, Object> values, String key) {
        Object value = values.get(key);
        return value == null ? null : value.toString();
    }

    private String value(Map<String, Object> values, String key, String fallback) {
        String value = stringValue(values, key);
        return value == null ? fallback : value;
    }

    private boolean booleanValue(Map<String, Object> values, String key, boolean fallback) {
        String value = stringValue(values, key);
        return value == null ? fallback : Boolean.parseBoolean(value);
    }

    private String databaseBlood(String bloodGroup) {
        String value = bloodGroup.toUpperCase();
        if (!value.matches("A[+-]|B[+-]|AB[+-]|O[+-]")) {
            throw new IllegalArgumentException("Choose a valid blood group");
        }
        return value.replace("+", "_POSITIVE").replace("-", "_NEGATIVE");
    }

    private String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private void addCorsHeaders(HttpExchange exchange) {
        String origin = exchange.getRequestHeaders().getFirst("Origin");
        if (origin == null) {
            origin = "http://localhost:5173";
        }
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", origin);
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Authorization,Content-Type");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
        exchange.getResponseHeaders().set("Vary", "Origin");
    }

    private String error(int status, String message, String path) {
        Map<String, Object> result = new HashMap<String, Object>();
        result.put("timestamp", java.time.Instant.now().toString());
        result.put("status", status);
        result.put("error", status == 400 ? "Bad Request" : status == 401 ? "Unauthorized"
                : status == 403 ? "Forbidden" : status == 404 ? "Not Found" : "Internal Server Error");
        result.put("message", message);
        result.put("path", path);
        return gson.toJson(result);
    }

    private void send(HttpExchange exchange, int status, String text) throws IOException {
        if (status != 204) {
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        }
        byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(status, status == 204 ? -1 : bytes.length);
        if (bytes.length > 0) {
            exchange.getResponseBody().write(bytes);
        }
        exchange.close();
    }

    private static class ApiException extends RuntimeException {
        private final int status;
        private ApiException(int status, String message) {
            super(message);
            this.status = status;
        }
    }
}
