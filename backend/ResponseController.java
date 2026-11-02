import com.sun.net.httpserver.HttpExchange;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.List;
import java.util.Map;
/** Handles a donor's own response list and response updates. */
public class ResponseController extends ApiController {
    public ResponseController(Database database, AuthService auth) {
        super(database, auth);
    }
    protected Object route(HttpExchange exchange) throws Exception {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();
        long userId = currentUser(exchange);
        if (path.equals("/api/v1/responses/mine") && method.equals("GET")) return responsesByDonor(requireUser(userId).getId());
        if (path.matches("/api/v1/responses/\\d+") && method.equals("PATCH")) return updateResponse(tail(path), userId, body(exchange));
        throw new ApiException(404, "Endpoint not found");
    }
    protected Object responsesByDonor(long uid)throws Exception {
        return formatResponses(rows("SELECT dr.*,u.full_name donor_name,u.phone_number donor_phone,dp.blood_group donor_blood_group FROM donor_responses dr JOIN users u ON u.id=dr.donor_id LEFT JOIN donor_profiles dp ON dp.user_id=u.id WHERE dr.donor_id=? ORDER BY dr.created_at DESC",args(uid)));
    }
    protected Object updateResponse(long id,long uid,Map<String,Object>b)throws Exception {
        User user=requireUser(uid);
        List<Map<String,Object>>r=rows("SELECT dr.*,br.requester_id FROM donor_responses dr JOIN blood_requests br ON br.id=dr.request_id WHERE dr.id=?",args(id));
        if(r.isEmpty())throw new ApiException(404,"Response not found");
        Map<String,Object> old=r.get(0);
        if(number(old.get("donor_id"))!=uid&&number(old.get("requester_id"))!=uid&&!"ROLE_ADMIN".equals(user.getRole()))throw new ApiException(403,"You cannot update this response");
        String status=value(b,"status",(String)old.get("status"));
        if(!status.equals("ACCEPTED")&&!status.equals("DECLINED")&&!status.equals("COMPLETED")&&!status.equals("CANCELLED"))throw new ApiException(400,"Invalid response status");
        try(Connection c=database.connect(); PreparedStatement p=c.prepareStatement("UPDATE donor_responses SET status=?,message=? WHERE id=?")) {
            p.setString(1,status);
            p.setString(2,value(b,"message",(String)old.get("message")));
            p.setLong(3,id);
            p.executeUpdate();
        }
        return responseById(id);
    }
}
