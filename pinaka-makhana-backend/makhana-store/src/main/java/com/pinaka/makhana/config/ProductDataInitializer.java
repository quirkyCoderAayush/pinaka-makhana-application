package com.pinaka.makhana.config;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.pinaka.makhana.entity.Product;
import com.pinaka.makhana.entity.Product.ProductCategory;
import com.pinaka.makhana.repository.ProductRepository;

/**
 * Initializes default Pinaka Makhana products on application startup if no products exist
 */
@Component
public class ProductDataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(ProductDataInitializer.class);
    
    private final ProductRepository productRepository;

    public ProductDataInitializer(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        initializeProductsIfEmpty();
    }

    private void initializeProductsIfEmpty() {
        try {
            logger.info("Checking for existing products...");
            
            long productCount = productRepository.count();
            
            if (productCount == 0) {
                logger.info("No products found. Initializing default Pinaka Makhana products...");
                createDefaultProducts();
            } else {
                logger.info("Found {} existing products. Skipping product initialization.", productCount);
            }
            
        } catch (Exception e) {
            logger.error("Error during product initialization", e);
        }
    }

    private void createDefaultProducts() {
        try {
            List<Product> products = Arrays.asList(
                createPeriPeriMakhana(),
                createCheeseMakhana(),
                createPuddinaMakhana(),
                createClassicSaltedMakhana()
            );

            List<Product> savedProducts = productRepository.saveAll(products);
            
            logger.info("✅ Successfully created {} Pinaka Makhana products!", savedProducts.size());
            savedProducts.forEach(product -> 
                logger.info("  - {} (ID: {}, SKU: {}, Price: ₹{})", 
                    product.getName(), product.getId(), product.getSku(), product.getPrice())
            );
            
        } catch (Exception e) {
            logger.error("Failed to create default products", e);
            throw new RuntimeException("Product initialization failed", e);
        }
    }

    private Product createPeriPeriMakhana() {
        Product product = new Product();
        product.setName("Pinaka Peri Peri Makhana");
        product.setFlavor("Peri Peri");
        product.setDescription("Experience the perfect blend of spice and crunch with our Peri Peri Makhana. Made from premium quality fox nuts, seasoned with authentic peri peri spices for a tantalizing taste that will leave you craving for more. A healthy snack that doesn't compromise on flavor!");
        product.setShortDescription("Spicy and crunchy peri peri flavored makhana - a perfect healthy snack");
        product.setPrice(299.0);
        product.setOriginalPrice(349.0);
        product.setImageUrl("https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500");
        // product.setAdditionalImages(Arrays.asList(
        //     "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500",
        //     "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500"
        // ));
        product.setRating(4.5);
        product.setReviewCount(127);
        product.setAvailable(true);
        product.setStockQuantity(150);
        product.setWeight("100g");
        product.setSku("PM-PP-100");
        product.setCategory(ProductCategory.FLAVORED_MAKHANA);
        // product.setTags(Arrays.asList("spicy", "peri peri", "healthy", "crunchy", "premium"));
        product.setPremium(true);
        product.setFeatured(true);
        product.setNewArrival(false);
        
        // Nutritional information per 100g
        product.setCalories(347.0);
        product.setProtein(9.7);
        product.setCarbohydrates(76.9);
        product.setFat(0.1);
        product.setFiber(14.5);
        
        product.setMetaTitle("Pinaka Peri Peri Makhana - Spicy Healthy Snack | 100g");
        product.setMetaDescription("Buy premium Peri Peri Makhana online. Healthy, spicy, and crunchy fox nuts perfect for snacking. Free delivery across India.");
        // product.setVariants(Arrays.asList("100g", "200g", "500g"));
        product.setMinOrderQuantity(1);
        product.setShippingWeight(0.12);
        product.setDimensions("15x10x5");
        
        return product;
    }

    private Product createCheeseMakhana() {
        Product product = new Product();
        product.setName("Pinaka Cheese Makhana");
        product.setFlavor("Cheese");
        product.setDescription("Indulge in the rich and creamy taste of our Cheese Makhana. Premium fox nuts coated with authentic cheese powder, creating a perfect balance of health and taste. Ideal for cheese lovers who want to snack guilt-free!");
        product.setShortDescription("Creamy cheese flavored makhana for the ultimate snacking experience");
        product.setPrice(279.0);
        product.setOriginalPrice(329.0);
        product.setImageUrl("https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500");
        // product.setAdditionalImages(Arrays.asList(
        //     "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500",
        //     "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500"
        // ));
        product.setRating(4.3);
        product.setReviewCount(89);
        product.setAvailable(true);
        product.setStockQuantity(120);
        product.setWeight("100g");
        product.setSku("PM-CH-100");
        product.setCategory(ProductCategory.FLAVORED_MAKHANA);
        // product.setTags(Arrays.asList("cheese", "creamy", "healthy", "premium", "kids-favorite"));
        product.setPremium(true);
        product.setFeatured(false);
        product.setNewArrival(true);
        
        // Nutritional information per 100g
        product.setCalories(352.0);
        product.setProtein(10.2);
        product.setCarbohydrates(75.8);
        product.setFat(0.3);
        product.setFiber(14.2);
        
        product.setMetaTitle("Pinaka Cheese Makhana - Creamy Healthy Snack | 100g");
        product.setMetaDescription("Delicious cheese flavored makhana made from premium fox nuts. Perfect healthy snack for kids and adults. Order online now!");
        // product.setVariants(Arrays.asList("100g", "200g", "500g"));
        product.setMinOrderQuantity(1);
        product.setShippingWeight(0.12);
        product.setDimensions("15x10x5");
        
        return product;
    }

    private Product createPuddinaMakhana() {
        Product product = new Product();
        product.setName("Pinaka Puddina Makhana");
        product.setFlavor("Mint (Puddina)");
        product.setDescription("Refresh your taste buds with our Puddina Makhana. Premium fox nuts infused with fresh mint flavor, offering a cool and refreshing snacking experience. Perfect for those who love the invigorating taste of mint combined with healthy nutrition!");
        product.setShortDescription("Refreshing mint flavored makhana for a cool and healthy snack");
        product.setPrice(289.0);
        product.setOriginalPrice(339.0);
        product.setImageUrl("https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500");
        // product.setAdditionalImages(Arrays.asList(
        //     "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500",
        //     "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500"
        // ));
        product.setRating(4.4);
        product.setReviewCount(76);
        product.setAvailable(true);
        product.setStockQuantity(100);
        product.setWeight("100g");
        product.setSku("PM-PD-100");
        product.setCategory(ProductCategory.FLAVORED_MAKHANA);
        // product.setTags(Arrays.asList("mint", "puddina", "refreshing", "healthy", "natural"));
        product.setPremium(false);
        product.setFeatured(true);
        product.setNewArrival(true);
        
        // Nutritional information per 100g
        product.setCalories(345.0);
        product.setProtein(9.5);
        product.setCarbohydrates(77.2);
        product.setFat(0.1);
        product.setFiber(14.8);
        
        product.setMetaTitle("Pinaka Puddina Makhana - Mint Flavored Healthy Snack | 100g");
        product.setMetaDescription("Fresh mint flavored makhana made from premium fox nuts. Refreshing and healthy snack perfect for any time. Buy online!");
        // product.setVariants(Arrays.asList("100g", "200g", "500g"));
        product.setMinOrderQuantity(1);
        product.setShippingWeight(0.12);
        product.setDimensions("15x10x5");
        
        return product;
    }

    private Product createClassicSaltedMakhana() {
        Product product = new Product();
        product.setName("Pinaka Classic Salted Makhana");
        product.setFlavor("Classic Salted");
        product.setDescription("Our signature Classic Salted Makhana represents the pure essence of premium fox nuts. Lightly salted to perfection, these crunchy delights offer the authentic taste of makhana while providing excellent nutrition. The perfect introduction to the world of healthy snacking!");
        product.setShortDescription("Premium classic salted makhana - pure, healthy, and delicious");
        product.setPrice(249.0);
        product.setOriginalPrice(299.0);
        product.setImageUrl("https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500");
        // product.setAdditionalImages(Arrays.asList(
        //     "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500",
        //     "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500"
        // ));
        product.setRating(4.6);
        product.setReviewCount(203);
        product.setAvailable(true);
        product.setStockQuantity(200);
        product.setWeight("100g");
        product.setSku("PM-CS-100");
        product.setCategory(ProductCategory.ROASTED_MAKHANA);
        // product.setTags(Arrays.asList("classic", "salted", "healthy", "natural", "bestseller"));
        product.setPremium(false);
        product.setFeatured(true);
        product.setNewArrival(false);
        
        // Nutritional information per 100g
        product.setCalories(347.0);
        product.setProtein(9.7);
        product.setCarbohydrates(76.9);
        product.setFat(0.1);
        product.setFiber(14.5);
        
        product.setMetaTitle("Pinaka Classic Salted Makhana - Premium Fox Nuts | 100g");
        product.setMetaDescription("Premium quality classic salted makhana. Healthy, crunchy, and delicious fox nuts perfect for guilt-free snacking. Order now!");
        // product.setVariants(Arrays.asList("100g", "200g", "500g", "1kg"));
        product.setMinOrderQuantity(1);
        product.setShippingWeight(0.12);
        product.setDimensions("15x10x5");
        
        return product;
    }
}
