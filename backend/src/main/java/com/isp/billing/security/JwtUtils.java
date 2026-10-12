package com.isp.billing.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtils {

    @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String jwtSecret;

    @Value("${jwt.expirationMs:86400000}")
    private int jwtExpirationMs;

    @Value("${jwt.refreshExpirationMs:604800000}") // 7 days default
    private long jwtRefreshExpirationMs;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    public String generateJwtToken(CustomUserDetails userPrincipal) {
        return Jwts.builder()
                .subject(userPrincipal.getUsername())
                .claim("type", "access")
                .claim("role", userPrincipal.getRole().name())
                .claim("resellerId", userPrincipal.getResellerId())
                .claim("resellerName", userPrincipal.getResellerName())
                .claim("resellerCode", userPrincipal.getResellerCode())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(key())
                .compact();
    }

    public String generateRefreshToken(CustomUserDetails userPrincipal) {
        return Jwts.builder()
                .subject(userPrincipal.getUsername())
                .claim("type", "refresh")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtRefreshExpirationMs))
                .signWith(key())
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public String getUserNameFromExpiredJwtToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        } catch (ExpiredJwtException e) {
            return e.getClaims().getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser().verifyWith(key()).build().parseSignedClaims(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean validateRefreshToken(String refreshToken) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key())
                    .build()
                    .parseSignedClaims(refreshToken)
                    .getPayload();
            return "refresh".equals(claims.get("type", String.class));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
