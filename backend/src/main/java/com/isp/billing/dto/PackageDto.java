package com.isp.billing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class PackageDto {
    private Long id;
    private String name;
    private Integer speedMbps;
    private BigDecimal monthlyPrice;
    private String description;
    private boolean active;

    public PackageDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getSpeedMbps() { return speedMbps; }
    public void setSpeedMbps(Integer speedMbps) { this.speedMbps = speedMbps; }

    public BigDecimal getMonthlyPrice() { return monthlyPrice; }
    public void setMonthlyPrice(BigDecimal monthlyPrice) { this.monthlyPrice = monthlyPrice; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
