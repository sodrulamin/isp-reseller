package com.isp.billing.security;

import com.isp.billing.entity.Reseller;
import com.isp.billing.entity.Role;
import com.isp.billing.repository.ResellerRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class WorkspaceContext {

    private final ResellerRepository resellerRepository;

    public WorkspaceContext(ResellerRepository resellerRepository) {
        this.resellerRepository = resellerRepository;
    }

    public CustomUserDetails getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails details) {
            return details;
        }
        return null;
    }

    public Long getActiveResellerId() {
        CustomUserDetails user = getCurrentUser();
        if (user == null) {
            throw new IllegalStateException("Unauthenticated request");
        }

        if (user.getRole() == Role.ROLE_SUPER_ADMIN) {
            // Super admin can specify an X-Workspace-Id header or query param, or fallback to their first reseller
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String workspaceHeader = request.getHeader("X-Workspace-Id");
                if (workspaceHeader != null && !workspaceHeader.trim().isEmpty()) {
                    try {
                        return Long.parseLong(workspaceHeader.trim());
                    } catch (NumberFormatException ignored) {}
                }
            }
            // If super admin didn't specify workspace, return null (indicating global view)
            return null;
        }

        return user.getResellerId();
    }

    public Reseller getActiveReseller() {
        Long resellerId = getActiveResellerId();
        if (resellerId == null) {
            return null;
        }
        return resellerRepository.findById(resellerId)
                .orElseThrow(() -> new IllegalArgumentException("Reseller not found with id: " + resellerId));
    }
}
