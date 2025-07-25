package com.pinaka.makhana.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pinaka.makhana.entity.Coupon;
import com.pinaka.makhana.service.CouponService;

@RestController
@RequestMapping("/api/coupons")
@CrossOrigin(origins = "*")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @GetMapping
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Coupon>> getActiveCoupons() {
        return ResponseEntity.ok(couponService.getActiveCoupons());
    }

    @GetMapping("/first-time")
    public ResponseEntity<List<Coupon>> getFirstTimeCoupons() {
        return ResponseEntity.ok(couponService.getActiveCouponsForFirstTimeUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Coupon> getCouponById(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.getCouponById(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Coupon> getCouponByCode(@PathVariable String code) {
        try {
            return ResponseEntity.ok(couponService.getCouponByCode(code));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        return new ResponseEntity<>(couponService.createCoupon(coupon), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Coupon> updateCoupon(@PathVariable Long id, @RequestBody Coupon coupon) {
        return ResponseEntity.ok(couponService.updateCoupon(id, coupon));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateCoupon(
            @RequestParam String code,
            @RequestParam Double amount,
            @RequestParam(required = false, defaultValue = "false") Boolean firstTimeUser) {
        boolean isValid = couponService.validateCoupon(code, amount, firstTimeUser);
        return ResponseEntity.ok(isValid);
    }

    @GetMapping("/calculate")
    public ResponseEntity<Double> calculateDiscount(
            @RequestParam String code,
            @RequestParam Double amount,
            @RequestParam(required = false, defaultValue = "false") Boolean firstTimeUser) {
        Double discount = couponService.calculateDiscount(code, amount, firstTimeUser);
        return ResponseEntity.ok(discount);
    }
    
    @PostMapping("/increment-usage/{code}")
    public ResponseEntity<Void> incrementCouponUsage(@PathVariable String code) {
        couponService.incrementCouponUsage(code);
        return ResponseEntity.ok().build();
    }
}