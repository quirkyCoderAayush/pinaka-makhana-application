// Product image mapping utility
import pack1 from "../images/pack1.jpg";
import pack2 from "../images/pack2.jpg";
import pack3 from "../images/pack3.jpg";
import pack4 from "../images/pack4.png";

// Map of product IDs to local images
const PRODUCT_IMAGE_MAP = {
  1: pack1,
  2: pack2,
  3: pack3,
  4: pack4,
};

/**
 * Get the local image for a product based on its ID
 * @param {Object} product - Product object with id
 * @returns {string} - Local image URL or fallback
 */
export const getProductImage = (product) => {
  if (!product) return pack1; // Default fallback
  
  // Try to get local image first
  const localImage = PRODUCT_IMAGE_MAP[product.id];
  if (localImage) return localImage;
  
  // Fallback to product's imageUrl or default
  return product.imageUrl || product.image || pack1;
};

/**
 * Add local image to product object
 * @param {Object} product - Product object
 * @returns {Object} - Product object with local image
 */
export const addLocalImageToProduct = (product) => {
  return {
    ...product,
    localImage: getProductImage(product)
  };
};

/**
 * Add local images to array of products
 * @param {Array} products - Array of product objects
 * @returns {Array} - Array of products with local images
 */
export const addLocalImagesToProducts = (products) => {
  if (!Array.isArray(products)) return [];
  return products.map(addLocalImageToProduct);
};

export default {
  getProductImage,
  addLocalImageToProduct,
  addLocalImagesToProducts
};
