import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.sql.SQLException;

/** Shared HTTP request and response handling for the feature controllers. */
public abstract class ApiController extends ApiSupport implements HttpHandler {
    public ApiController(Database database, AuthService auth) {
        super(database, auth);
    }

    /** Each child class handles one part of the API. */
    protected abstract Object route(HttpExchange exchange) throws Exception;

    public void handle(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        addCorsHeaders(exchange);
        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            send(exchange, 204, "");
            return;
        }
        try {
            Object result = route(exchange);
            int status = "POST".equals(exchange.getRequestMethod()) && !path.equals("/api/v1/auth/login") ? 201 : 200;
            send(exchange, status, gson.toJson(result));
        } catch (ApiException e) {
            send(exchange, e.status, error(e.status, e.getMessage(), path));
        } catch (SQLException e) {
            if (e instanceof java.sql.SQLIntegrityConstraintViolationException) {
                send(exchange, 409, error(409, "A record with these values already exists", path));
            } else {
                e.printStackTrace();
                send(exchange, 500, error(500, "Internal server error", path));
            }
        } catch (Exception e) {
            e.printStackTrace();
            send(exchange, 500, error(500, "Internal server error", path));
        }
    }

    private void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", origin(exchange));
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Authorization,Content-Type");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,OPTIONS");
        exchange.getResponseHeaders().set("Vary", "Origin");
    }
}
