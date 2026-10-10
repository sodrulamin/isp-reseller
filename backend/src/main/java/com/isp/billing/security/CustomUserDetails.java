package com.isp.billing.security;

import com.isp.billing.entity.Role;
import com.isp.billing.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class CustomUserDetails implements UserDetails {

    private final Long id;
    private final String username;
    private final String password;
    private final String fullName;
    private final Role role;
    private final Long resellerId;
    private final String resellerName;
    private final String resellerCode;
    private final boolean active;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.password = user.getPassword();
        this.fullName = user.getFullName();
        this.role = user.getRole();
        this.active = user.isActive();
        this.resellerId = user.getReseller() != null ? user.getReseller().getId() : null;
        this.resellerName = user.getReseller() != null ? user.getReseller().getName() : null;
        this.resellerCode = user.getReseller() != null ? user.getReseller().getCode() : null;
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()));
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public Role getRole() { return role; }
    public Long getResellerId() { return resellerId; }
    public String getResellerName() { return resellerName; }
    public String getResellerCode() { return resellerCode; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return active; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return active; }
}
