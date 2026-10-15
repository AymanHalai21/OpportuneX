package com.opportunex.api.controller;
import com.opportunex.api.service.OpportuneXService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final OpportuneXService service;
    public AuthController(OpportuneXService service){this.service=service;}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String,String> b){
        return ResponseEntity.ok(service.login(b.get("email"),b.get("password")));
    }
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String,String> b){
        return ResponseEntity.ok(service.signup(b.get("name"),b.get("email"),b.get("password"),b.get("college")));
    }
    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest r){return ResponseEntity.ok(service.getMe((Long)r.getAttribute("userId")));}
}
