import com.sun.net.httpserver.HttpExchange;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
/** Handles donor search and donor profile updates. */
public class DonorController extends ApiController {
    public DonorController(Database database, AuthService auth) {
        super(database, auth);
    }
    protected Object route(HttpExchange exchange) throws Exception {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();
        Map<String, String> query = query(exchange.getRequestURI().getRawQuery());
        Map<String, Object> body = body(exchange);
        long userId = currentUser(exchange);
        if (path.equals("/api/v1/donors") && method.equals("GET")) return donorSearch(query);
        if (path.equals("/api/v1/donors") && method.equals("POST")) return createDonor(userId, body);
        if (path.equals("/api/v1/donors/me") && method.equals("GET")) return donorForUser(requireUser(userId).getId());
        if (path.matches("/api/v1/donors/\\d+/availability") && method.equals("PATCH")) return availability(tail(path), userId, body);
        if (path.matches("/api/v1/donors/\\d+")) {
            if (method.equals("GET")) return donorById(tail(path), userId);
            if (method.equals("PUT")) return updateDonor(tail(path), userId, body);
        }
        throw new ApiException(404, "Endpoint not found");
    }
    protected Object donorSearch(Map<String,String> q) throws Exception {
        int page=integer(q,"page",0), size=integer(q,"size",10);
        if(page<0||size<1||size>100)throw new ApiException(400,"Invalid page or size");
        StringBuilder where=new StringBuilder(" WHERE 1=1");
        List<Object> args=new ArrayList<Object>();
        if(q.get("bloodGroup")!=null) {
            where.append(" AND d.blood_group=?");
            args.add(dbBlood(q.get("bloodGroup")));
        }
        if(q.get("city")!=null) {
            where.append(" AND LOWER(d.city)=LOWER(?)");
            args.add(q.get("city"));
        }
        if(!"false".equals(q.get("availableOnly"))) {
            where.append(" AND d.is_available=TRUE");
        }
        long total=count("SELECT COUNT(*) FROM donor_profiles d"+where,args);
        String sql="SELECT d.id,d.user_id,u.full_name,d.blood_group,d.city,d.area,d.is_available,d.consent_to_contact,d.last_donation_date,d.total_donations FROM donor_profiles d JOIN users u ON u.id=d.user_id"+where+" ORDER BY d.updated_at DESC LIMIT ? OFFSET ?";
        args.add(size);
        args.add(page*size);
        List<Map<String,Object>> rows=rows(sql,args);
        for(Map<String,Object> r:rows) {
            String name=(String)r.remove("full_name");
            r.put("displayName",maskedName(name));
            r.put("bloodGroup",uiBlood((String)r.remove("blood_group")));
            r.put("userId",r.remove("user_id"));
            r.put("isAvailable",r.remove("is_available"));
            r.put("consentToContact",r.remove("consent_to_contact"));
            r.put("lastDonationDate",r.remove("last_donation_date"));
            r.put("totalDonations",r.remove("total_donations"));
        }
        return page(rows,page,size,total);
    }
    protected Object createDonor(long uid,Map<String,Object>b)throws Exception {
        User u=requireUser(uid);
        if(!"ROLE_DONOR".equals(u.getRole()))throw new ApiException(403,"Donor role required");
        String bg=required(b,"bloodGroup");
        try(Connection c=database.connect(); PreparedStatement p=c.prepareStatement("INSERT INTO donor_profiles(user_id,blood_group,city,area,is_available,consent_to_contact,last_donation_date,notes) VALUES(?,?,?,?,?,?,?,?)",Statement.RETURN_GENERATED_KEYS)) {
            p.setLong(1,uid);
            p.setString(2,dbBlood(bg));
            p.setString(3,value(b,"city",u.getCity()));
            p.setString(4,str(b,"area"));
            p.setBoolean(5,bool(b,"isAvailable",true));
            p.setBoolean(6,bool(b,"consentToContact",true));
            p.setString(7,str(b,"lastDonationDate"));
            p.setString(8,str(b,"notes"));
            p.executeUpdate();
            try(ResultSet k=p.getGeneratedKeys()) {
                if(k.next())return donorById(k.getLong(1),uid);
            }
        }
        throw new ApiException(500,"Could not create profile");
    }
    protected Object donorForUser(long uid)throws Exception {
        List<Map<String,Object>> r=rows("SELECT id FROM donor_profiles WHERE user_id=?",args(uid));
        if(r.isEmpty())throw new ApiException(404,"Donor profile not found");
        return donorById(number(r.get(0).get("id")),uid);
    }
    protected Object donorById(long id,long uid)throws Exception {
        List<Map<String,Object>> r=rows("SELECT d.id,d.user_id,u.full_name,u.email,u.phone_number,d.blood_group,d.city,d.area,d.is_available,d.consent_to_contact,d.last_donation_date,d.total_donations,d.notes,d.created_at,d.updated_at FROM donor_profiles d JOIN users u ON u.id=d.user_id WHERE d.id=?",args(id));
        if(r.isEmpty())throw new ApiException(404,"Donor profile not found");
        Map<String,Object> m=r.get(0);
        long owner=number(m.remove("user_id"));
        m.put("userId",owner);
        m.put("bloodGroup",uiBlood((String)m.remove("blood_group")));
        m.put("isAvailable",m.remove("is_available"));
        m.put("available",m.get("isAvailable"));
        m.put("consentToContact",m.remove("consent_to_contact"));
        m.put("lastDonationDate",m.remove("last_donation_date"));
        m.put("totalDonations",m.remove("total_donations"));
        m.put("createdAt",m.remove("created_at"));
        m.put("updatedAt",m.remove("updated_at"));
        if(uid!=owner&&!Boolean.TRUE.equals(m.get("consentToContact"))) {
            m.remove("phone_number");
            m.remove("email");
        }
        m.put("phoneNumber",m.remove("phone_number"));
        return m;
    }
    protected Object updateDonor(long id,long uid,Map<String,Object>b)throws Exception {
        Map<String,Object> old=asMap(donorById(id,uid));
        if(number(old.get("userId"))!=uid&&!isAdmin(uid))throw new ApiException(403,"You cannot update this profile");
        String sql="UPDATE donor_profiles SET blood_group=?,city=?,area=?,is_available=?,consent_to_contact=?,last_donation_date=?,notes=? WHERE id=?";
        try(Connection c=database.connect(); PreparedStatement p=c.prepareStatement(sql)) {
            p.setString(1,dbBlood(value(b,"bloodGroup",uiBloodForDb(old.get("bloodGroup")))));
            p.setString(2,value(b,"city",(String)old.get("city")));
            p.setString(3,value(b,"area",(String)old.get("area")));
            p.setBoolean(4,bool(b,"isAvailable",Boolean.TRUE.equals(old.get("isAvailable"))));
            p.setBoolean(5,bool(b,"consentToContact",Boolean.TRUE.equals(old.get("consentToContact"))));
            p.setString(6,value(b,"lastDonationDate",(String)old.get("lastDonationDate")));
            p.setString(7,value(b,"notes",(String)old.get("notes")));
            p.setLong(8,id);
            p.executeUpdate();
        }
        return donorById(id,uid);
    }
    protected Object availability(long id,long uid,Map<String,Object>b)throws Exception {
        Map<String,Object> old=asMap(donorById(id,uid));
        if(number(old.get("userId"))!=uid&&!isAdmin(uid))throw new ApiException(403,"You cannot update this profile");
        try(Connection c=database.connect(); PreparedStatement p=c.prepareStatement("UPDATE donor_profiles SET is_available=? WHERE id=?")) {
            p.setBoolean(1,bool(b,"isAvailable",false));
            p.setLong(2,id);
            p.executeUpdate();
        }
        return donorById(id,uid);
    }
}
