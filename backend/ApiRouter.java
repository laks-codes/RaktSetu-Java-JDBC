import com.sun.net.httpserver.HttpExchange;
/** Selects a small controller based on the first part of the API URL. */
public class ApiRouter extends ApiController {
    private final AuthController authController;
    private final DonorController donorController;
    private final RequestController requestController;
    private final ResponseController responseController;
    private final AdminController adminController;
    public ApiRouter(Database database, AuthService auth) {
        super(database, auth);
        authController = new AuthController(database, auth);
        donorController = new DonorController(database, auth);
        requestController = new RequestController(database, auth);
        responseController = new ResponseController(database, auth);
        adminController = new AdminController(database, auth);
    }
    protected Object route(HttpExchange exchange) throws Exception {
        String path = exchange.getRequestURI().getPath();
        if (path.startsWith("/api/v1/auth/")) return authController.route(exchange);
        if (path.startsWith("/api/v1/donors")) return donorController.route(exchange);
        if (path.startsWith("/api/v1/requests")) return requestController.route(exchange);
        if (path.startsWith("/api/v1/responses")) return responseController.route(exchange);
        if (path.startsWith("/api/v1/admin/")) return adminController.route(exchange);
        throw new ApiException(404, "Endpoint not found");
    }
}
