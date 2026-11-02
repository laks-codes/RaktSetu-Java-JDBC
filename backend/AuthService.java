import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/** Keeps passwords private and creates login tokens. */
public class AuthService {
    private final Database database;
    private final byte[] secret;

    public AuthService(Database database) {
        this.database = database;
        String key = System.getenv("JWT_SECRET");
        if (key == null || key.length() < 32) {
            throw new IllegalStateException("Set JWT_SECRET to a private value with at least 32 characters");
        }
        secret = key.getBytes(StandardCharsets.UTF_8);
    }

    public User findByEmail(String email) throws Exception {
        return database.findUserByEmail(email);
    }

    public User findById(long id) throws Exception {
        return database.findUserById(id);
    }

    public long createUser(User user, String password, String bloodGroup, boolean shareContact) throws Exception {
        String passwordHash = org.mindrot.jbcrypt.BCrypt.hashpw(
                password, org.mindrot.jbcrypt.BCrypt.gensalt(10));
        return database.createUser(user, passwordHash, bloodGroup, shareContact);
    }

    public boolean passwordMatches(String password, String passwordHash) {
        return passwordHash != null && org.mindrot.jbcrypt.BCrypt.checkpw(password, passwordHash);
    }

    public String issueToken(User user) throws Exception {
        long expiry = System.currentTimeMillis() / 1000 + 86400;
        String header = encode("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        String payload = encode("{\"sub\":" + user.getId() + ",\"role\":\"" + user.getRole()
                + "\",\"exp\":" + expiry + "}");
        String signature = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(sign(header + "." + payload));
        return header + "." + payload + "." + signature;
    }

    public long tokenUserId(String token) throws Exception {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return 0;
            }
            byte[] expected = sign(parts[0] + "." + parts[1]);
            byte[] actual = Base64.getUrlDecoder().decode(parts[2]);
            if (!MessageDigest.isEqual(expected, actual)) {
                return 0;
            }

            String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            java.util.regex.Matcher id = java.util.regex.Pattern.compile("\\\"sub\\\":(\\d+)").matcher(payload);
            java.util.regex.Matcher expiry = java.util.regex.Pattern.compile("\\\"exp\\\":(\\d+)").matcher(payload);
            if (!id.find() || !expiry.find()
                    || Long.parseLong(expiry.group(1)) < System.currentTimeMillis() / 1000) {
                return 0;
            }
            return Long.parseLong(id.group(1));
        } catch (Exception e) {
            return 0;
        }
    }

    private String encode(String text) {
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(text.getBytes(StandardCharsets.UTF_8));
    }

    private byte[] sign(String text) throws Exception {
        javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
        mac.init(new javax.crypto.spec.SecretKeySpec(secret, "HmacSHA256"));
        return mac.doFinal(text.getBytes(StandardCharsets.UTF_8));
    }
}
