package com.pinaka.makhana.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pinaka.makhana.entity.Coupon;
import com.pinaka.makhana.repository.CouponRepository;
import com.pinaka.makhana.service.CouponService;

@Service
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    public CouponServiceImpl(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @Override
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Override
    public Coupon getCouponById(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found with id: " + id));
    }

    @Override
    public Coupon getCouponByCode(String code) {
        return couponRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Coupon not found with code: " + code));
    }

    @Override
    public List<Coupon> getActiveCoupons() {
        return couponRepository.findByActiveTrue();
    }

    @Override
    public List<Coupon> getActiveCouponsForFirstTimeUsers() {
        return couponRepository.findByActiveTrueAndFirstTimeUserOnly(true);
    }

    @Override
    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        // Set creation timestamp if not already set
        if (coupon.getCreatedAt() == null) {
            LocalDateTime now = LocalDateTime.now();
            coupon.setCreatedAt(now);
            coupon.setUpdatedAt(now);
        }
        return couponRepository.save(coupon);
    }

    @Override
    @Transactional
    public Coupon updateCoupon(Long id, Coupon couponDetails) {
        Coupon coupon = getCouponById(id);
        
        // Update fields
        coupon.setCode(couponDetails.getCode());
        coupon.setDescription(couponDetails.getDescription());
        coupon.setDiscountType(couponDetails.getDiscountType());
        coupon.setDiscountValue(couponDetails.getDiscountValue());
        coupon.setMinimumOrderAmount(couponDetails.getMinimumOrderAmount());
        coupon.setMaximumDiscountAmount(couponDetails.getMaximumDiscountAmount());
        coupon.setStartDate(couponDetails.getStartDate());
        coupon.setEndDate(couponDetails.getEndDate());
        coupon.setUsageLimit(couponDetails.getUsageLimit());
        coupon.setUserUsageLimit(couponDetails.getUserUsageLimit());
        coupon.setActive(couponDetails.isActive());
        coupon.setFirstTimeUserOnly(couponDetails.isFirstTimeUserOnly());
        coupon.setFreeShipping(couponDetails.isFreeShipping());
        
        return couponRepository.save(coupon);
    }

    @Override
    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = getCouponById(id);
        couponRepository.delete(coupon);
    }

    @Override
    public Double calculateDiscount(String couponCode, Double orderAmount, boolean isFirstTimeUser) {
        try {
            Coupon coupon = getCouponByCode(couponCode);
            
            if (!validateCoupon(couponCode, orderAmount, isFirstTimeUser)) {
                return 0.0;
            }
            
            return coupon.calculateDiscount(orderAmount, isFirstTimeUser);
        } catch (Exception e) {
            return 0.0; // Return zero discount if coupon not found or invalid
        }
    }

    @Override
    public boolean validateCoupon(String couponCode, Double orderAmount, boolean isFirstTimeUser) {
        try {
            Coupon coupon = getCouponByCode(couponCode);
            return coupon.canBeUsed(orderAmount, isFirstTimeUser);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    @Transactional
    public void incrementCouponUsage(String couponCode) {
        Coupon coupon = getCouponByCode(couponCode);
        coupon.incrementUsage();
        couponRepository.save(coupon);
    }
}