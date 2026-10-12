package com.isp.billing.dto;

import com.isp.billing.entity.Role;

public class AuthResponse {
    private String token;
    private String refreshToken;
    private Long id;
    private String username;
    private String fullName;
    private Role role;
    private Long resellerId;
    private String resellerName;
    private String resellerCode;

    public AuthResponse() {}

    public AuthResponse(String token, String refreshToken, Long id, String username, String fullName, Role role, Long resellerId, String resellerName, String resellerCode) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.resellerId = resellerId;
        this.resellerName = resellerName;
        this.resellerCode = resellerCode;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Long getResellerId() { return resellerId; }
    public void setResellerId(Long resellerId) { this.resellerId = resellerId; }

    public String getResellerName() { return resellerName; }
    public void setResellerName(String resellerName) { this.resellerName = resellerName; }

    public String getResellerCode() { return resellerCode; }
    public void setResellerCode(String resellerCode) { this.resellerCode = resellerCode; }
}
