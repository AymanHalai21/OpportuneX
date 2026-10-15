package com.opportunex.api.controller;
import com.opportunex.api.service.OpportuneXService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {
    private final OpportuneXService s;
    public EventController(OpportuneXService s){this.s=s;}
    private Long uid(HttpServletRequest r){return (Long)r.getAttribute("userId");}

    @GetMapping public Object all(HttpServletRequest r){return s.events(uid(r));}
    @GetMapping("/{id}") public Object one(HttpServletRequest r,@PathVariable Long id){return s.event(uid(r),id);}
    @PostMapping("/{id}/join") public ResponseEntity<?> join(HttpServletRequest r,@PathVariable Long id){s.join(uid(r),id);return ResponseEntity.ok(Map.of("success",true));}
    @PostMapping("/{id}/follow") public ResponseEntity<?> follow(HttpServletRequest r,@PathVariable Long id){return ResponseEntity.ok(Map.of("success",true));}
    @PostMapping public Object create(HttpServletRequest r,@RequestBody Map<String,Object>b){return s.createEvent(uid(r),b);}
    @PutMapping("/{id}") public ResponseEntity<?> update(HttpServletRequest r,@PathVariable Long id,@RequestBody Map<String,Object>b){s.updateEvent(uid(r),id,b);return ResponseEntity.ok(Map.of("success",true));}
    @DeleteMapping("/{id}") public ResponseEntity<?> delete(HttpServletRequest r,@PathVariable Long id){s.cancelEvent(uid(r),id);return ResponseEntity.ok(Map.of("success",true));}
    @GetMapping("/{id}/dashboard") public Object dashboard(HttpServletRequest r,@PathVariable Long id){return s.dashboard(uid(r),id);}
    @PostMapping("/{id}/checkin") public ResponseEntity<?> checkin(HttpServletRequest r,@PathVariable Long id,@RequestBody Map<String,String>b){s.checkIn(uid(r),id,b.getOrDefault("studentName","Admitted Student"),b.getOrDefault("ticketCode",""));return ResponseEntity.ok(Map.of("success",true));}
    @PostMapping("/{id}/attendee-toggle") public ResponseEntity<?> attendeeToggle(HttpServletRequest r,@PathVariable Long id,@RequestBody Map<String,String>b){s.toggleAttendee(uid(r),id,b.get("studentName"));return ResponseEntity.ok(Map.of("success",true));}
}
