package com.pinaka.makhana.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 200)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(nullable = false)
    private Double discountValue; // Percentage or fixed amount

    private Double minimumOrderAmount;
    private Double maximumDiscountAmount; // For percentage discounts

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    private Integer usageLimit; // Total usage limit
    private Integer usageCount = 0; // Current usage count
    private Integer userUsageLimit = 1; // Per user usage limit

    @Column(nullable = false)
    private boolean active = true;

    private boolean firstTimeUserOnly = false;
    private boolean freeShipping = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Enum for discount types
    public enum DiscountType {
        PERCENTAGE("Percentage"),
        FIXED_AMOUNT("Fixed Amount"),
        FREE_SHIPPING("Free Shipping");

        private final String displayName;

        DiscountType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    // Default constructor
    public Coupon() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor
    public Coupon(String code, String description, DiscountType discountType, 
                  Double discountValue, LocalDateTime startDate, LocalDateTime endDate) {
        this();
        this.code = code;
        this.description = description;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.startDate = startDate;
        this.endDate = endDate;
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
        this.updatedAt = LocalDateTime.now();
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }

    public DiscountType getDiscountType() {
        return discountType;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
        this.updatedAt = LocalDateTime.now();
    }

    public Double getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(Double discountValue) {
        this.discountValue = discountValue;
        this.updatedAt = LocalDateTime.now();
    }

    public Double getMinimumOrderAmount() {
        return minimumOrderAmount;
    }

    public void setMinimumOrderAmount(Double minimumOrderAmount) {
        this.minimumOrderAmount = minimumOrderAmount;
        this.updatedAt = LocalDateTime.now();
    }

    public Double getMaximumDiscountAmount() {
        return maximumDiscountAmount;
    }

    public void setMaximumDiscountAmount(Double maximumDiscountAmount) {
        this.maximumDiscountAmount = maximumDiscountAmount;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
        this.updatedAt = LocalDateTime.now();
    }

    public Integer getUsageLimit() {
        return usageLimit;
    }

    public void setUsageLimit(Integer usageLimit) {
        this.usageLimit = usageLimit;
        this.updatedAt = LocalDateTime.now();
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
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isFirstTimeUserOnly() {
        return firstTimeUserOnly;
    }

    public void setFirstTimeUserOnly(boolean firstTimeUserOnly) {
        this.firstTimeUserOnly = firstTimeUserOnly;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isFreeShipping() {
        return freeShipping;
    }

    public void setFreeShipping(boolean freeShipping) {
        this.freeShipping = freeShipping;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // Helper methods
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return active && 
               now.isAfter(startDate) && 
               now.isBefore(endDate) &&
               (usageLimit == null || usageCount < usageLimit);
    }

    public boolean canBeUsed(Double orderAmount, boolean isFirstTimeUser) {
        if (!isValid()) return false;
        
        if (minimumOrderAmount != null && orderAmount < minimumOrderAmount) {
            return false;
        }
        
        if (firstTimeUserOnly && !isFirstTimeUser) {
            return false;
        }
        
        return true;
    }

    public Double calculateDiscount(Double orderAmount) {
        if (!canBeUsed(orderAmount, false)) return 0.0;
        
        Double discount = 0.0;
        
        switch (discountType) {
            case PERCENTAGE:
                discount = orderAmount * (discountValue / 100);
                if (maximumDiscountAmount != null && discount > maximumDiscountAmount) {
                    discount = maximumDiscountAmount;
                }
                break;
            case FIXED_AMOUNT:
                discount = Math.min(discountValue, orderAmount);
                break;
            case FREE_SHIPPING:
                // Free shipping discount would be calculated based on shipping cost
                discount = 0.0; // This would be handled separately
                break;
        }
        
        return discount;
    }

    public void incrementUsage() {
        this.usageCount++;
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "Coupon [id=" + id + ", code=" + code + ", discountType=" + discountType + 
               ", discountValue=" + discountValue + ", active=" + active + "]";
    }
}