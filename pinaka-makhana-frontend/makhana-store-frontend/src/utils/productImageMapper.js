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
 * Get the image for a product - prioritizes uploaded images over local ones
 * @param {Object} product - Product object with id
 * @returns {string} - Image URL
 */
export const getProductImage = (product) => {
  if (!product) {
    return pack1; // Default fallback
  }

  // PRIORITY 1: Use uploaded image URL if available
  if (product.imageUrl && product.imageUrl.trim() !== '') {
    let imageUrl = product.imageUrl.trim();

    // Check if it's already a base64 data URL (for locally uploaded images)
    if (imageUrl.startsWith('data:image/')) {
      return imageUrl;
    }

    // Handle different URL formats for uploaded images
    if (imageUrl.includes('/uploads/images/')) {
      // Check if it's a local file reference
      const filename = imageUrl.split('/').pop();

      try {
        const localFiles = JSON.parse(localStorage.getItem('localFiles') || '{}');

        // Check all local files for base64 data
        for (const [fileId, fileData] of Object.entries(localFiles)) {
          if (fileData.base64Data && (fileId === filename || fileData.originalName === filename)) {
            return fileData.base64Data;
          }
        }
      } catch (error) {
        // Silent error handling
      }

      // If it's a backend URL that's not accessible, convert to frontend URL
      if (imageUrl.startsWith('http://localhost:8081/')) {
        imageUrl = imageUrl.replace('http://localhost:8081/', '/');
      }

      // Add cache-busting parameter for uploaded images to force refresh
      const separator = imageUrl.includes('?') ? '&' : '?';
      const finalUrl = `${imageUrl}${separator}t=${Date.now()}`;
      return finalUrl;
    }

    return imageUrl;
  }

  // PRIORITY 2: Use product.image if available
  if (product.image && product.image.trim() !== '') {
    return product.image;
  }

  // PRIORITY 3: Try to get local image as fallback
  const localImage = PRODUCT_IMAGE_MAP[product.id];
  if (localImage) {
    return localImage;
  }

  // PRIORITY 4: Default fallback
  return pack1;
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
