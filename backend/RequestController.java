import com.sun.net.httpserver.HttpExchange;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
/** Handles blood requests and responses attached to each request. */
public class RequestController extends ApiController {
    public RequestController(Database database, AuthService auth) {
        super(database, auth);
    }
    protected Object route(HttpExchange exchange) throws Exception {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();
        Map<String, String> query = query(exchange.getRequestURI().getRawQuery());
        Map<String, Object> body = body(exchange);
        long userId = currentUser(exchange);
        if (path.equals("/api/v1/requests") && method.equals("GET")) return requestSearch(query);
        if (path.equals("/api/v1/requests") && method.equals("POST")) return createRequest(userId, body);
        if (path.equals("/api/v1/requests/mine") && method.equals("GET")) return requestsByUser(requireUser(userId).getId());
        if (path.matches("/api/v1/requests/\\d+/responses")) {
            long requestId = segmentId(path, 4);
            if (method.equals("POST")) return createResponse(requestId, userId, body);
            if (method.equals("GET")) return responsesForRequest(requestId, userId);
        }
        if (path.matches("/api/v1/requests/\\d+/status") && method.equals("PATCH")) return updateRequestStatus(tail(path), userId, body);
        if (path.matches("/api/v1/requests/\\d+") && method.equals("GET")) return requestById(tail(path));
        throw new ApiException(404, "Endpoint not found");
    }
    protected Object requestSearch(Map<String,String> q)throws Exception {
        int page=integer(q,"page",0),size=integer(q,"size",10);
        if(page<0||size<1||size>100)throw new ApiException(400,"Invalid page or size");
        StringBuilder w=new StringBuilder(" WHERE 1=1");
        List<Object>a=new ArrayList<Object>();
        if(q.get("bloodGroup")!=null) {
            w.append(" AND r.blood_group=?");
            a.add(dbBlood(q.get("bloodGroup")));
        }
        if(q.get("city")!=null) {
            w.append(" AND LOWER(r.city)=LOWER(?)");
            a.add(q.get("city"));
        }
        w.append(" AND r.status=?");
        a.add(queryValue(q,"status","OPEN"));
        if(q.get("urgency")!=null) {
            w.append(" AND r.urgency=?");
            a.add(q.get("urgency"));
        }
        long total=count("SELECT COUNT(*) FROM blood_requests r"+w,a);
        a.add(size);
        a.add(page*size);
        return page(formatRequests(rows("SELECT r.*,u.full_name requester_name,(SELECT COUNT(*) FROM donor_responses dr WHERE dr.request_id=r.id) response_count FROM blood_requests r JOIN users u ON u.id=r.requester_id"+w+" ORDER BY r.created_at DESC LIMIT ? OFFSET ?",a)),page,size,total);
    }
    protected Object createRequest(long uid,Map<String,Object>b)throws Exception {
        User user=requireUser(uid);
        if(!"ROLE_REQUESTER".equals(user.getRole())&&!"ROLE_ADMIN".equals(user.getRole()))throw new ApiException(403,"Requester role required");
        long units=num(b,"unitsRequested");
        if(units<1)throw new ApiException(400,"unitsRequested must be greater than zero");
        String urgency=required(b,"urgency");
        if(!urgency.equals("CRITICAL")&&!urgency.equals("URGENT")&&!urgency.equals("NORMAL"))throw new ApiException(400,"Invalid urgency");
        String sql="INSERT INTO blood_requests(requester_id,patient_name,blood_group,units_requested,hospital_name,hospital_address,city,area,urgency,required_by,contact_phone,notes) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)";
        try(Connection c=database.connect(); PreparedStatement p=c.prepareStatement(sql,Statement.RETURN_GENERATED_KEYS)) {
            p.setLong(1,uid);
            p.setString(2,required(b,"patientName"));
            p.setString(3,dbBlood(required(b,"bloodGroup")));
            p.setInt(4,(int)units);
            p.setString(5,required(b,"hospitalName"));
            p.setString(6,str(b,"hospitalAddress"));
            p.setString(7,required(b,"city"));
            p.setString(8,str(b,"area"));
            p.setString(9,urgency);
            p.setString(10,sqlDateTime(required(b,"requiredBy")));
            p.setString(11,required(b,"contactPhone"));
            p.setString(12,str(b,"notes"));
            p.executeUpdate();
            try(ResultSet k=p.getGeneratedKeys()) {
                if(k.next())return requestById(k.getLong(1));
            }
        }
        throw new ApiException(500,"Could not create request");
    }
    protected Object requestById(long id)throws Exception {
        List<Map<String,Object>>r=rows("SELECT r.*,u.full_name requester_name,(SELECT COUNT(*) FROM donor_responses dr WHERE dr.request_id=r.id) response_count FROM blood_requests r JOIN users u ON u.id=r.requester_id WHERE r.id=?",args(id));
        if(r.isEmpty())throw new ApiException(404,"Blood request not found");
        return formatRequest(r.get(0));
    }
    protected Object requestsByUser(long uid)throws Exception {
        return formatList(rows("SELECT r.*,u.full_name requester_name,(SELECT COUNT(*) FROM donor_responses dr WHERE dr.request_id=r.id) response_count FROM blood_requests r JOIN users u ON u.id=r.requester_id WHERE r.requester_id=? ORDER BY r.created_at DESC",args(uid)));
    }
    protected Object updateRequestStatus(long id,long uid,Map<String,Object>b)throws Exception {
        User user=requireUser(uid);
        Map<String,Object> current=asMap(requestById(id));
        if(number(current.get("requesterId"))!=uid&&!"ROLE_ADMIN".equals(user.getRole()))throw new ApiException(403,"You cannot update this request");
        String status=required(b,"status");
        String old=(String)current.get("status");
        if(!validTransition(old,status))throw new ApiException(400,"Invalid request status transition");
        try(Connection c=database.connect(); PreparedStatement p=c.prepareStatement("UPDATE blood_requests SET status=? WHERE id=?")) {
            p.setString(1,status);
            p.setLong(2,id);
            p.executeUpdate();
        }
        if("ROLE_ADMIN".equals(user.getRole()))audit(uid,"UPDATE_REQUEST_STATUS","BloodRequest",id,value(b,"reason","Status updated"));
        return requestById(id);
    }
    protected boolean validTransition(String from,String to) {
        return (from.equals("OPEN")&&(to.equals("IN_PROGRESS")||to.equals("CANCELLED")))||(from.equals("IN_PROGRESS")&&(to.equals("FULFILLED")||to.equals("CANCELLED")));
    }
    protected Object createResponse(long rid,long uid,Map<String,Object>b)throws Exception {
        User user=requireUser(uid);
        if(!"ROLE_DONOR".equals(user.getRole()))throw new ApiException(403,"Donor role required");
        Map<String,Object> req=asMap(requestById(rid));
        if(!"OPEN".equals(req.get("status"))&&!"IN_PROGRESS".equals(req.get("status")))throw new ApiException(400,"Request is closed");
        String responseStatus=value(b,"status","ACCEPTED");
        if(!responseStatus.equals("ACCEPTED")&&!responseStatus.equals("DECLINED"))throw new ApiException(400,"Response status must be ACCEPTED or DECLINED");
        long responseId=0;
        try(Connection c=database.connect()) {
            c.setAutoCommit(false);
            try(PreparedStatement p=c.prepareStatement("INSERT INTO donor_responses(request_id,donor_id,status,message,estimated_arrival) VALUES(?,?,?,?,?)",Statement.RETURN_GENERATED_KEYS)) {
                p.setLong(1,rid);
                p.setLong(2,uid);
                p.setString(3,responseStatus);
                p.setString(4,str(b,"message"));
                p.setString(5,sqlDateTime(str(b,"estimatedArrival")));
                p.executeUpdate();
                try(ResultSet k=p.getGeneratedKeys()) {
                    if(k.next())responseId=k.getLong(1);
                }
            }
            if("OPEN".equals(req.get("status"))&&"ACCEPTED".equals(responseStatus)) {
                try(PreparedStatement p=c.prepareStatement("UPDATE blood_requests SET status='IN_PROGRESS' WHERE id=? AND status='OPEN'")) {
                    p.setLong(1,rid);
                    p.executeUpdate();
                }
            }
            c.commit();
        }
        if(responseId>0)return responseById(responseId);
        throw new ApiException(500,"Could not save donor response");
    }
    protected Object responsesForRequest(long rid,long uid)throws Exception {
        User u=requireUser(uid);
        Map<String,Object> req=asMap(requestById(rid));
        if(number(req.get("requesterId"))!=uid&&!"ROLE_ADMIN".equals(u.getRole()))throw new ApiException(403,"You cannot view these responses");
        return formatResponses(rows("SELECT dr.*,u.full_name donor_name,u.phone_number donor_phone,dp.blood_group donor_blood_group FROM donor_responses dr JOIN users u ON u.id=dr.donor_id LEFT JOIN donor_profiles dp ON dp.user_id=u.id WHERE dr.request_id=? ORDER BY dr.created_at",args(rid)));
    }
}
