package com.opportunex.api.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {
    private final JwtService jwtService;

    public AuthInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();
        if ("OPTIONS".equalsIgnoreCase(request.getMethod()) || path.equals("/api/auth/login") || path.equals("/api/auth/signup") || path.equals("/api/health") || !path.startsWith("/api/")) return true;

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            unauthorized(response, "Please sign in to continue");
            return false;
        }

        try {
            Long userId = jwtService.userId(header.substring(7));
            request.setAttribute("userId", userId);
            return true;
        } catch (Exception e) {
            unauthorized(response, "Your session has expired. Please sign in again.");
            return false;
        }
    }

    private static void unauthorized(HttpServletResponse response, String message) throws java.io.IOException {
        response.setStatus(401);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }
}
