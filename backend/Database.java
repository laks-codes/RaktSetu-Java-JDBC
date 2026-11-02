import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/** Opens MySQL connections and saves or finds user accounts. */
public class Database {
    private final String url;
    private final String username;
    private final String password;

    public Database() {
        String host = setting("MYSQL_HOST", "localhost");
        String port = setting("MYSQL_PORT", "3306");
        String name = setting("MYSQL_DATABASE", "raktsetu_db");
        url = "jdbc:mysql://" + host + ":" + port + "/" + name
                + "?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        username = setting("MYSQL_USER", "raktsetu_user");
        password = setting("MYSQL_PASSWORD", "raktsetu_secret");
    }

    public Connection connect() throws SQLException {
        return DriverManager.getConnection(url, username, password);
    }

    public User findUserByEmail(String email) throws SQLException {
        String sql = "SELECT id,email,password_hash,full_name,phone_number,city,role,status,created_at "
                + "FROM users WHERE email=?";
        try (Connection connection = connect();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, email);
            try (ResultSet result = statement.executeQuery()) {
                return result.next() ? readUser(result) : null;
            }
        }
    }

    public User findUserById(long id) throws SQLException {
        String sql = "SELECT id,email,password_hash,full_name,phone_number,city,role,status,created_at "
                + "FROM users WHERE id=?";
        try (Connection connection = connect();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, id);
            try (ResultSet result = statement.executeQuery()) {
                return result.next() ? readUser(result) : null;
            }
        }
    }

    public long createUser(User user, String passwordHash) throws SQLException {
        String sql = "INSERT INTO users(email,password_hash,full_name,phone_number,city,role,status) "
                + "VALUES(?,?,?,?,?,?, 'ACTIVE')";
        try (Connection connection = connect();
             PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, user.getEmail());
            statement.setString(2, passwordHash);
            statement.setString(3, user.getFullName());
            statement.setString(4, user.getPhoneNumber());
            statement.setString(5, user.getCity());
            statement.setString(6, user.getRole());
            statement.executeUpdate();

            try (ResultSet keys = statement.getGeneratedKeys()) {
                if (keys.next()) {
                    return keys.getLong(1);
                }
            }
        }
        throw new SQLException("MySQL did not return a user id");
    }

    private User readUser(ResultSet result) throws SQLException {
        User user = new User();
        user.setId(result.getLong("id"));
        user.setEmail(result.getString("email"));
        user.setPasswordHash(result.getString("password_hash"));
        user.setFullName(result.getString("full_name"));
        user.setPhoneNumber(result.getString("phone_number"));
        user.setCity(result.getString("city"));
        user.setRole(result.getString("role"));
        user.setStatus(result.getString("status"));
        user.setCreatedAt(result.getTimestamp("created_at").toInstant().toString());
        return user;
    }

    private String setting(String key, String fallback) {
        String value = System.getenv(key);
        return value == null || value.isEmpty() ? fallback : value;
    }
}
