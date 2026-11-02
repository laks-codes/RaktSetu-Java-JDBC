import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/** Handles password hashing, basic login checks, and signed bearer tokens. */
public class AuthService {
    private final UserDao users;
    private final byte[] secret;
    private final long lifetimeSeconds;
    public AuthService(UserDao users) {
        this.users = users;
        String key = System.getenv("JWT_SECRET");
        if (key == null || key.length() < 32) throw new IllegalStateException("Set JWT_SECRET to a private value of at least 32 characters");
        secret = key.getBytes(StandardCharsets.UTF_8);
        String lifetime = System.getenv("JWT_EXPIRATION_MS");
        long milliseconds = 86400000L;
        if (lifetime != null) {
            try { milliseconds = Long.parseLong(lifetime); } catch (NumberFormatException ignored) { }
        }
        lifetimeSeconds = milliseconds / 1000;
    }
    public User findByEmail(String email) throws Exception { return users.findByEmail(email); }
    public User findById(long id) throws Exception { return users.findById(id); }
    public long create(User user, String password) throws Exception { return users.create(user, hash(password)); }
    public boolean passwordMatches(String password, String stored) throws Exception {
        if (stored == null) return false;
        return org.mindrot.jbcrypt.BCrypt.checkpw(password, stored);
    }
    public String hash(String password) throws Exception {
        return org.mindrot.jbcrypt.BCrypt.hashpw(password, org.mindrot.jbcrypt.BCrypt.gensalt(10));
    }
    public String issueToken(User user) throws Exception {
        long expiry = System.currentTimeMillis() / 1000 + lifetimeSeconds;
        String payload = "{\"sub\":" + user.getId() + ",\"role\":\"" + user.getRole() + "\",\"exp\":" + expiry + "}";
        String header = Base64.getUrlEncoder().withoutPadding().encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
        String body = Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        String signature = Base64.getUrlEncoder().withoutPadding().encodeToString(sign(header + "." + body));
        return header + "." + body + "." + signature;
    }
    private byte[] sign(String value) throws Exception {
        javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
        mac.init(new javax.crypto.spec.SecretKeySpec(secret, "HmacSHA256"));
        return mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
    }
    public long tokenUserId(String token) throws Exception {
        String[] parts = token.split("\\."); if (parts.length != 3) return 0;
        if (!MessageDigest.isEqual(sign(parts[0] + "." + parts[1]), Base64.getUrlDecoder().decode(parts[2]))) return 0;
        String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
        java.util.regex.Matcher id = java.util.regex.Pattern.compile("\\\"sub\\\":(\\d+)").matcher(payload);
        java.util.regex.Matcher exp = java.util.regex.Pattern.compile("\\\"exp\\\":(\\d+)").matcher(payload);
        if (!id.find() || !exp.find() || Long.parseLong(exp.group(1)) < System.currentTimeMillis() / 1000) return 0;
        return Long.parseLong(id.group(1));
    }
}
