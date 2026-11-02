import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
/** JDBC implementation of user persistence. Every query uses parameters. */
public class JdbcUserDao implements UserDao {
    private final Database database;
    public JdbcUserDao(Database database) {
        this.database = database;
    }
    public User findByEmail(String email) throws SQLException {
        String sql = "SELECT id,email,full_name,phone_number,city,role,status,created_at FROM users WHERE email = ?";
        try (Connection connection = database.connect(); PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, email);
            try (ResultSet rows = statement.executeQuery()) {
                return rows.next() ? readUser(rows) : null;
            }
        }
    }
    public User findById(long id) throws SQLException {
        String sql = "SELECT id,email,full_name,phone_number,city,role,status,created_at FROM users WHERE id = ?";
        try (Connection connection = database.connect(); PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, id);
            try (ResultSet rows = statement.executeQuery()) {
                return rows.next() ? readUser(rows) : null;
            }
        }
    }
    public long create(User user, String passwordHash) throws SQLException {
        String sql = "INSERT INTO users(email,password_hash,full_name,phone_number,city,role,status) VALUES(?,?,?,?,?,?,'ACTIVE')";
        try (Connection connection = database.connect(); PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, user.getEmail());
            statement.setString(2, passwordHash);
            statement.setString(3, user.getFullName());
            statement.setString(4, user.getPhoneNumber());
            statement.setString(5, user.getCity());
            statement.setString(6, user.getRole());
            statement.executeUpdate();
            try (ResultSet keys = statement.getGeneratedKeys()) {
                if (keys.next()) return keys.getLong(1);
            }
        }
        throw new SQLException("Database did not return a user id");
    }
    private User readUser(ResultSet rows) throws SQLException {
        User user = new User();
        user.setId(rows.getLong("id"));
        user.setEmail(rows.getString("email"));
        user.setFullName(rows.getString("full_name"));
        user.setPhoneNumber(rows.getString("phone_number"));
        user.setCity(rows.getString("city"));
        user.setRole(rows.getString("role"));
        user.setStatus(rows.getString("status"));
        user.setCreatedAt(rows.getTimestamp("created_at").toInstant().toString());
        return user;
    }
}
