package com.pinaka.makhana.service;

import java.util.List;

import com.pinaka.makhana.entity.Coupon;

public interface CouponService {
    
    List<Coupon> getAllCoupons();
    
    Coupon getCouponById(Long id);
    
    Coupon getCouponByCode(String code);
    
    List<Coupon> getActiveCoupons();
    
    List<Coupon> getActiveCouponsForFirstTimeUsers();
    
    Coupon createCoupon(Coupon coupon);
    
    Coupon updateCoupon(Long id, Coupon coupon);
    
    void deleteCoupon(Long id);
    
    Double calculateDiscount(String couponCode, Double orderAmount, boolean isFirstTimeUser);
    
    boolean validateCoupon(String couponCode, Double orderAmount, boolean isFirstTimeUser);
    
    void incrementCouponUsage(String couponCode);
}