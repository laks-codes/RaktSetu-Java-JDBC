import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Finds donors and saves blood requests. */
public class BloodService {
    private final Database database;

    public BloodService(Database database) {
        this.database = database;
    }

    public Object searchDonors(Map<String, String> query) throws Exception {
        StringBuilder sql = new StringBuilder(
                "SELECT d.id,d.user_id,u.full_name,u.email,u.phone_number,d.blood_group,"
                + "d.city,d.area,d.consent_to_contact,d.last_donation_date,d.total_donations "
                + "FROM donor_profiles d JOIN users u ON u.id=d.user_id "
                + "WHERE d.is_available=TRUE");
        List<String> values = new ArrayList<String>();

        if (query.get("bloodGroup") != null && !query.get("bloodGroup").isEmpty()) {
            sql.append(" AND d.blood_group=?");
            values.add(databaseBlood(query.get("bloodGroup")));
        }
        if (query.get("city") != null && !query.get("city").isEmpty()) {
            sql.append(" AND LOWER(d.city)=LOWER(?)");
            values.add(query.get("city"));
        }
        sql.append(" ORDER BY d.updated_at DESC");

        List<Map<String, Object>> donors = new ArrayList<Map<String, Object>>();
        try (Connection connection = database.connect();
             PreparedStatement statement = connection.prepareStatement(sql.toString())) {
            for (int i = 0; i < values.size(); i++) {
                statement.setString(i + 1, values.get(i));
            }
            try (ResultSet rows = statement.executeQuery()) {
                while (rows.next()) {
                    donors.add(donorDetails(rows));
                }
            }
        }

        Map<String, Object> result = new HashMap<String, Object>();
        result.put("content", donors);
        result.put("pageNumber", 0);
        result.put("pageSize", donors.size());
        result.put("totalElements", donors.size());
        result.put("totalPages", donors.isEmpty() ? 0 : 1);
        result.put("last", true);
        return result;
    }

    public Object createRequest(User user, Map<String, Object> body) throws Exception {
        long units = longValue(body, "unitsRequested");
        if (units < 1) {
            throw new IllegalArgumentException("Units required must be greater than zero");
        }

        String sql = "INSERT INTO blood_requests(requester_id,patient_name,blood_group,units_requested,"
                + "hospital_name,hospital_address,city,area,urgency,required_by,contact_phone,notes) "
                + "VALUES(?,?,?,?,?,?,?,?,?,?,?,?)";
        try (Connection connection = database.connect();
             PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            statement.setLong(1, user.getId());
            statement.setString(2, required(body, "patientName"));
            statement.setString(3, databaseBlood(required(body, "bloodGroup")));
            statement.setLong(4, units);
            statement.setString(5, required(body, "hospitalName"));
            statement.setString(6, stringValue(body, "hospitalAddress"));
            statement.setString(7, required(body, "city"));
            statement.setString(8, stringValue(body, "area"));
            statement.setString(9, required(body, "urgency"));
            statement.setString(10, required(body, "requiredBy").replace('T', ' ').replace("Z", ""));
            statement.setString(11, required(body, "contactPhone"));
            statement.setString(12, stringValue(body, "notes"));
            statement.executeUpdate();

            try (ResultSet keys = statement.getGeneratedKeys()) {
                if (keys.next()) {
                    Map<String, Object> result = new HashMap<String, Object>();
                    result.put("id", keys.getLong(1));
                    result.put("message", "Blood request submitted successfully");
                    return result;
                }
            }
        }
        throw new IllegalStateException("Could not save blood request");
    }

    private Map<String, Object> donorDetails(ResultSet row) throws Exception {
        Map<String, Object> donor = new HashMap<String, Object>();
        long donorUserId = row.getLong("user_id");
        String fullName = row.getString("full_name");
        boolean sharesContact = row.getBoolean("consent_to_contact");

        donor.put("id", row.getLong("id"));
        donor.put("userId", donorUserId);
        donor.put("displayName", sharesContact ? fullName : maskedName(fullName));
        donor.put("bloodGroup", displayBloodGroup(row.getString("blood_group")));
        donor.put("city", row.getString("city"));
        donor.put("area", row.getString("area"));
        donor.put("isAvailable", true);
        donor.put("consentToContact", sharesContact);
        donor.put("lastDonationDate", row.getString("last_donation_date"));
        donor.put("totalDonations", row.getInt("total_donations"));

        if (sharesContact) {
            donor.put("phoneNumber", row.getString("phone_number"));
            donor.put("email", row.getString("email"));
        }
        return donor;
    }

    private long longValue(Map<String, Object> values, String key) {
        Object value = values.get(key);
        if (value instanceof Number) {
            double number = ((Number) value).doubleValue();
            if (number != Math.floor(number) || number < 1 || number > Integer.MAX_VALUE) {
                throw new IllegalArgumentException(key + " must be a whole number from 1 to 2147483647");
            }
            return ((Number) value).longValue();
        }
        try {
            long number = Long.parseLong(required(values, key));
            if (number < 1 || number > Integer.MAX_VALUE) {
                throw new IllegalArgumentException(key + " must be a whole number from 1 to 2147483647");
            }
            return number;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(key + " must be a number");
        }
    }

    private String required(Map<String, Object> values, String key) {
        String value = stringValue(values, key);
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(key + " is required");
        }
        return value.trim();
    }

    private String stringValue(Map<String, Object> values, String key) {
        Object value = values.get(key);
        return value == null ? null : value.toString();
    }

    private String databaseBlood(String bloodGroup) {
        String value = bloodGroup.toUpperCase();
        if (!value.matches("A[+-]|B[+-]|AB[+-]|O[+-]")) {
            throw new IllegalArgumentException("Choose a valid blood group");
        }
        return value.replace("+", "_POSITIVE").replace("-", "_NEGATIVE");
    }

    private String displayBloodGroup(String bloodGroup) {
        return bloodGroup.replace("_POSITIVE", "+").replace("_NEGATIVE", "-");
    }

    private String maskedName(String fullName) {
        String[] names = fullName.trim().split("\\s+");
        if (names.length == 1) {
            return names[0];
        }
        return names[0] + " " + names[names.length - 1].charAt(0) + ".";
    }
}
