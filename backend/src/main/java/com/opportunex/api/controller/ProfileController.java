package com.opportunex.api.controller;
import com.opportunex.api.service.OpportuneXService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final OpportuneXService s;
    public ProfileController(OpportuneXService s){this.s=s;}
    private Long uid(HttpServletRequest r){return (Long)r.getAttribute("userId");}
    @PutMapping public Object update(HttpServletRequest r,@RequestBody Map<String,Object>b){s.updateProfile(uid(r),b);return s.getMe(uid(r));}
    @PostMapping("/interests") public Object add(HttpServletRequest r,@RequestBody Map<String,String>b){s.addInterest(uid(r),b.get("interest"));return s.getMe(uid(r));}
    @DeleteMapping("/interests") public Object remove(HttpServletRequest r,@RequestParam String interest){s.removeInterest(uid(r),interest);return s.getMe(uid(r));}
    @GetMapping("/follows") public Object follows(HttpServletRequest r){return s.follows(uid(r));}
    @PostMapping("/follow") public ResponseEntity<?> follow(HttpServletRequest r,@RequestBody Map<String,String>b){s.follow(uid(r),b.get("organizer"));return ResponseEntity.ok(Map.of("success",true));}
}
