package com.pinaka.makhana.dto;

import java.time.LocalDateTime;

import com.pinaka.makhana.entity.Coupon.DiscountType;

public class CouponDTO {
    private Long id;
    private String code;
    private String description;
    private DiscountType discountType;
    private Double discountValue;
    private Double minimumOrderAmount;
    private Double maximumDiscountAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer usageLimit;
    private Integer usageCount;
    private Integer userUsageLimit;
    private boolean active;
    private boolean firstTimeUserOnly;
    private boolean freeShipping;

    // Default constructor
    public CouponDTO() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public DiscountType getDiscountType() {
        return discountType;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }

    public Double getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(Double discountValue) {
        this.discountValue = discountValue;
    }

    public Double getMinimumOrderAmount() {
        return minimumOrderAmount;
    }

    public void setMinimumOrderAmount(Double minimumOrderAmount) {
        this.minimumOrderAmount = minimumOrderAmount;
    }

    public Double getMaximumDiscountAmount() {
        return maximumDiscountAmount;
    }

    public void setMaximumDiscountAmount(Double maximumDiscountAmount) {
        this.maximumDiscountAmount = maximumDiscountAmount;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public Integer getUsageLimit() {
        return usageLimit;
    }

    public void setUsageLimit(Integer usageLimit) {
        this.usageLimit = usageLimit;
    }

    public Integer getUsageCount() {
        return usageCount;
    }

    public void setUsageCount(Integer usageCount) {
        this.usageCount = usageCount;
    }

    public Integer getUserUsageLimit() {
        return userUsageLimit;
    }

    public void setUserUsageLimit(Integer userUsageLimit) {
        this.userUsageLimit = userUsageLimit;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isFirstTimeUserOnly() {
        return firstTimeUserOnly;
    }

    public void setFirstTimeUserOnly(boolean firstTimeUserOnly) {
        this.firstTimeUserOnly = firstTimeUserOnly;
    }

    public boolean isFreeShipping() {
        return freeShipping;
    }

    public void setFreeShipping(boolean freeShipping) {
        this.freeShipping = freeShipping;
    }
}