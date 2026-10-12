package com.isp.billing.controller;

import com.isp.billing.dto.AuthRequest;
import com.isp.billing.dto.AuthResponse;
import com.isp.billing.entity.User;
import com.isp.billing.repository.UserRepository;
import com.isp.billing.security.CustomUserDetails;
import com.isp.billing.security.JwtUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    public AuthController(AuthenticationManager authenticationManager, JwtUtils jwtUtils, UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            String jwt = jwtUtils.generateJwtToken(userDetails);
            String refreshToken = jwtUtils.generateRefreshToken(userDetails);

            AuthResponse response = new AuthResponse(
                    jwt,
                    refreshToken,
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getFullName(),
                    userDetails.getRole(),
                    userDetails.getResellerId(),
                    userDetails.getResellerName(),
                    userDetails.getResellerCode()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid username or password: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null || !jwtUtils.validateRefreshToken(refreshToken)) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired refresh token"));
        }

        try {
            String username = jwtUtils.getUserNameFromJwtToken(refreshToken);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

            if (!user.isActive()) {
                return ResponseEntity.status(401).body(Map.of("message", "User account is inactive"));
            }

            CustomUserDetails userDetails = new CustomUserDetails(user);
            String newAccessToken = jwtUtils.generateJwtToken(userDetails);
            String newRefreshToken = jwtUtils.generateRefreshToken(userDetails);

            return ResponseEntity.ok(Map.of(
                    "token", newAccessToken,
                    "refreshToken", newRefreshToken
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Failed to refresh token: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }
        return ResponseEntity.ok(Map.of(
                "id", userDetails.getId(),
                "username", userDetails.getUsername(),
                "fullName", userDetails.getFullName(),
                "role", userDetails.getRole().name(),
                "resellerId", userDetails.getResellerId() != null ? userDetails.getResellerId() : "",
                "resellerName", userDetails.getResellerName() != null ? userDetails.getResellerName() : "",
                "resellerCode", userDetails.getResellerCode() != null ? userDetails.getResellerCode() : ""
        ));
    }
}
