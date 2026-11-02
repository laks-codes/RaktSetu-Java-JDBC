import com.sun.net.httpserver.HttpExchange;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Map;
/** Handles registration, login, and the current-user endpoint. */
public class AuthController extends ApiController {
    public AuthController(Database database, AuthService auth) {
        super(database, auth);
    }
    protected Object route(HttpExchange exchange) throws Exception {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();
        Map<String, Object> body = body(exchange);
        long userId = currentUser(exchange);
        if (path.equals("/api/v1/auth/register") && method.equals("POST")) return register(body);
        if (path.equals("/api/v1/auth/login") && method.equals("POST")) return login(body);
        if (path.equals("/api/v1/auth/me") && method.equals("GET")) return publicUser(requireUser(userId));
        throw new ApiException(404, "Endpoint not found");
    }
    protected Object register(Map<String,Object> b) throws Exception {
        String email = required(b,"email"), password = required(b,"password");
        if (auth.findByEmail(email) != null) throw new ApiException(409,"Email is already registered");
        User u = new User();
        u.setEmail(email);
        u.setFullName(required(b,"fullName"));
        u.setPhoneNumber(str(b,"phoneNumber"));
        u.setCity(required(b,"city"));
        String role = str(b,"role");
        if (role == null) role = "ROLE_REQUESTER";
        if (!role.equals("ROLE_REQUESTER") && !role.equals("ROLE_DONOR")) throw new ApiException(400,"Invalid role");
        u.setRole(role);
        u.setStatus("ACTIVE");
        u.setId(auth.create(u,password));
        u=auth.findById(u.getId());
        if (role.equals("ROLE_DONOR") && b.get("bloodGroup") != null) {
            try (Connection c=database.connect(); PreparedStatement p=c.prepareStatement("INSERT INTO donor_profiles(user_id,blood_group,city) VALUES(?,?,?)")) {
                p.setLong(1,u.getId());
                p.setString(2,dbBlood(str(b,"bloodGroup")));
                p.setString(3,u.getCity());
                p.executeUpdate();
            }
        }
        return authResponse(u);
    }
    protected Object login(Map<String,Object> b) throws Exception {
        String email=required(b,"email"), password=required(b,"password");
        User u=auth.findByEmail(email);
        String stored=null;
        try(Connection c=database.connect(); PreparedStatement p=c.prepareStatement("SELECT password_hash FROM users WHERE email=?")) {
            p.setString(1,email);
            try(ResultSet r=p.executeQuery()) {
                if(r.next())stored=r.getString(1);
            }
        }
        if(u==null || !auth.passwordMatches(password,stored)) throw new ApiException(401,"Invalid email or password");
        if(!"ACTIVE".equals(u.getStatus())) throw new ApiException(403,"Account is not active");
        return authResponse(u);
    }
    protected Object authResponse(User u) throws Exception {
        Map<String,Object> m=map();
        m.put("token",auth.issueToken(u));
        m.put("type","Bearer");
        m.put("user",publicUser(u));
        return m;
    }
    protected Object publicUser(User u) {
        Map<String,Object> m=map();
        m.put("id",u.getId());
        m.put("email",u.getEmail());
        m.put("fullName",u.getFullName());
        m.put("phoneNumber",u.getPhoneNumber());
        m.put("city",u.getCity());
        m.put("role",u.getRole());
        m.put("status",u.getStatus());
        m.put("createdAt",u.getCreatedAt());
        return m;
    }
}
