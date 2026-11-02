import com.sun.net.httpserver.HttpExchange;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.List;
import java.util.Map;
/** Handles administrator dashboard, moderation, and audit reports. */
public class AdminController extends ApiController {
    public AdminController(Database database, AuthService auth) {
        super(database, auth);
    }
    protected Object route(HttpExchange exchange) throws Exception {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();
        Map<String, String> query = query(exchange.getRequestURI().getRawQuery());
        Map<String, Object> body = body(exchange);
        long userId = currentUser(exchange);
        if (path.equals("/api/v1/admin/dashboard") && method.equals("GET")) {
            requireAdmin(userId);
            return dashboard();
        }
        if (path.equals("/api/v1/admin/reports") && method.equals("GET")) {
            requireAdmin(userId);
            return auditReports(query);
        }
        if (path.matches("/api/v1/admin/users/\\d+/status") && method.equals("PATCH")) return updateUserStatus(tail(path), userId, body);
        if (path.matches("/api/v1/admin/requests/\\d+/close") && method.equals("PATCH")) return closeRequest(tail(path), userId, query.get("reason"));
        throw new ApiException(404, "Endpoint not found");
    }
    protected Object dashboard()throws Exception {
        Map<String,Object>m=map();
        m.put("totalUsers",count("SELECT COUNT(*) FROM users",args()));
        m.put("totalDonors",count("SELECT COUNT(*) FROM donor_profiles",args()));
        m.put("activeDonors",count("SELECT COUNT(*) FROM donor_profiles WHERE is_available=TRUE",args()));
        m.put("totalRequests",count("SELECT COUNT(*) FROM blood_requests",args()));
        m.put("openRequests",count("SELECT COUNT(*) FROM blood_requests WHERE status='OPEN'",args()));
        m.put("inProgressRequests",count("SELECT COUNT(*) FROM blood_requests WHERE status='IN_PROGRESS'",args()));
        m.put("fulfilledRequests",count("SELECT COUNT(*) FROM blood_requests WHERE status='FULFILLED'",args()));
        m.put("totalResponses",count("SELECT COUNT(*) FROM donor_responses",args()));
        long total=number(m.get("totalRequests")),fulfilled=number(m.get("fulfilledRequests"));
        m.put("fulfillmentRate",total==0?0:Math.round(fulfilled*1000.0/total)/10.0);
        return m;
    }
    protected Object auditReports(Map<String,String>q)throws Exception {
        int page=integer(q,"page",0),size=integer(q,"size",10);
        long total=count("SELECT COUNT(*) FROM audit_logs",args());
        List<Map<String,Object>>r=rows("SELECT a.id,a.admin_id,u.email admin_email,a.action,a.target_entity,a.target_id,a.reason,a.timestamp FROM audit_logs a JOIN users u ON u.id=a.admin_id ORDER BY a.timestamp DESC LIMIT ? OFFSET ?",args(size,page*size));
        for(Map<String,Object>m:r) {
            m.put("adminId",m.remove("admin_id"));
            m.put("adminEmail",m.remove("admin_email"));
            m.put("targetEntity",m.remove("target_entity"));
            m.put("targetId",m.remove("target_id"));
        }
        return page(r,page,size,total);
    }
    protected Object updateUserStatus(long id,long adminId,Map<String,Object>b)throws Exception {
        requireAdmin(adminId);
        String status=required(b,"status"),reason=required(b,"reason");
        try(Connection c=database.connect(); PreparedStatement p=c.prepareStatement("UPDATE users SET status=? WHERE id=?")) {
            p.setString(1,status);
            p.setLong(2,id);
            if(p.executeUpdate()==0)throw new ApiException(404,"User not found");
        }
        audit(adminId,"UPDATE_USER_STATUS","User",id,reason);
        Map<String,Object>r=map();
        r.put("success",true);
        r.put("message","User status successfully updated to "+status);
        return r;
    }
    protected Object closeRequest(long id,long adminId,String reason)throws Exception {
        requireAdmin(adminId);
        if(reason==null||reason.isBlank())throw new ApiException(400,"Reason is required");
        try(Connection c=database.connect(); PreparedStatement p=c.prepareStatement("UPDATE blood_requests SET status='CANCELLED' WHERE id=?")) {
            p.setLong(1,id);
            if(p.executeUpdate()==0)throw new ApiException(404,"Blood request not found");
        }
        audit(adminId,"CLOSE_REQUEST","BloodRequest",id,reason);
        Map<String,Object>r=map();
        r.put("success",true);
        r.put("message","Blood request closed by administrator");
        return r;
    }
}
