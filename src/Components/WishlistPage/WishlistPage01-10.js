import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import './WishlistPage.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import baseURL from '../URL/BaseURL';

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingItem, setRemovingItem] = useState({});

  // Get current logged-in customer ID
  const getCustomerId = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.id || user.customer_id || user.user_id || null;
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    const customerId = localStorage.getItem('customerId') || 
                      localStorage.getItem('customer_id') || 
                      localStorage.getItem('userId');
    
    if (customerId) {
      return parseInt(customerId);
    }
    
    return null;
  };

  // Fetch wishlist items
  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      const customerId = getCustomerId();
      
      if (!customerId) {
        setError('Please login to view your wishlist');
        setLoading(false);
        return;
      }

      const response = await fetch(`${baseURL}/api/wishlist/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Wishlist API Response:', data);

      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        items = data.data;
      }

      // Filter items for current customer
      const customerItems = items.filter(item => item.customer === customerId);
      console.log('Customer wishlist items:', customerItems);

      // Fetch product details for each wishlist item using the product ID
      const productPromises = customerItems.map(async (item) => {
        try {
          const productId = item.product;
          // Fetch product details using the product ID
          const productResponse = await fetch(`${baseURL}/api/opening-tags/${productId}/`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });
          
          if (!productResponse.ok) {
            throw new Error(`HTTP error! status: ${productResponse.status}`);
          }
          
          const productData = await productResponse.json();
          console.log(`Product ${productId} details:`, productData);
          
          // Extract the product data from the response
          const productDetails = productData.data || productData;
          
          return {
            ...item,
            productDetails: productDetails
          };
        } catch (err) {
          console.error(`Error fetching product ${item.product}:`, err);
          return {
            ...item,
            productDetails: null
          };
        }
      });

      const productsWithDetails = await Promise.all(productPromises);
      setWishlistItems(productsWithDetails);
      setError(null);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to load wishlist items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  // Remove from wishlist
  const removeFromWishlist = async (wishlistId, productName) => {
    const result = await Swal.fire({
      title: 'Remove from Wishlist?',
      text: `Are you sure you want to remove "${productName}" from your wishlist?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel',
      background: '#1a1a1a',
      color: '#ffffff',
    });

    if (!result.isConfirmed) {
      return;
    }

    setRemovingItem(prev => ({ ...prev, [wishlistId]: true }));

    try {
      const response = await fetch(`${baseURL}/api/wishlist/${wishlistId}/`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove item from state
      setWishlistItems(prev => prev.filter(item => item.wishlist_id !== wishlistId));

      // Update wishlist count in navbar
      window.dispatchEvent(new Event('wishlistUpdated'));

      Swal.fire({
        title: 'Removed!',
        text: `${productName} has been removed from your wishlist.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: '#1a1a1a',
        color: '#ffffff',
      });
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to remove item from wishlist. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33',
        background: '#1a1a1a',
        color: '#ffffff',
      });
    } finally {
      setRemovingItem(prev => ({ ...prev, [wishlistId]: false }));
    }
  };

  // Add to cart
  const addToCart = async (product, item) => {
    try {
      const customerId = getCustomerId();
      
      if (!customerId) {
        Swal.fire({
          title: 'Please Login',
          text: 'You need to login to add items to cart.',
          icon: 'warning',
          confirmButtonColor: '#C9A84C',
          background: '#1a1a1a',
          color: '#ffffff',
        });
        return;
      }

      // Get the product ID from the wishlist item
      const productId = product.opentag_id || item.product;
      
      // Get the total price from product data
      const unitPrice = parseFloat(product.total_price) || 0;
      
      const cartData = {
        customer: customerId,
        quantity: 1,
        unit_price: unitPrice.toFixed(2),
        discount: "0",
        gst_percentage: "0",
        gst_amount: "0",
        total_price: unitPrice.toFixed(2),
        product: productId
      };

      console.log('Adding to cart:', cartData);

      const response = await fetch(`${baseURL}/api/cart/add-item/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(cartData)
      });

      const responseData = await response.json();
      console.log('Cart response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to add to cart');
      }

      // Update cart count in navbar
      window.dispatchEvent(new Event('cartUpdated'));

      Swal.fire({
        title: 'Added to Cart!',
        text: `${product.product_name || product.sub_category || 'Product'} has been added to your cart.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: '#1a1a1a',
        color: '#ffffff',
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to add to cart. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33',
        background: '#1a1a1a',
        color: '#ffffff',
      });
    }
  };

  // Navigate to product detail
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Get image URL
  const getImageUrl = (product) => {
    if (product.image) return product.image;
    // Check if there's any image URL in the product data
    if (product.productData?.image) return product.productData.image;
    // Fallback images based on category or sub_category
    if (product.category === 'GOLD JEWELLERY' || product.sub_category === 'GOLD JEWELLERY') {
      return 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center';
    }
    if (product.category === 'SILVER JEWELLERY' || product.sub_category === 'SILVER PATTI') {
      return 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400&h=400&fit=crop&crop=center';
    }
    return 'https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Jewellery';
  };

  // Get product name
  const getProductName = (product) => {
    if (product.product_name) return product.product_name;
    if (product.sub_category) {
      const prefix = product.prefix || '';
      return `${product.sub_category} ${prefix}`.trim();
    }
    return 'Jewellery Item';
  };

  // Get product price
  const getProductPrice = (product) => {
    return parseFloat(product.total_price) || 0;
  };

  // Get product weight
  const getProductWeight = (product) => {
    return product.gross_weight || product.gross_weight || '0g';
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="wishlist-loading">
          <div className="loader"></div>
          <p>Loading your wishlist...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <Navbar />
        <div className="wishlist-error">
          <h2>😕 {error}</h2>
          <button onClick={fetchWishlistItems} className="retry-btn">
            Retry
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="wishlist-page">
        {/* Header */}
        <div className="wishlist-header">
          <h1>❤️ My Wishlist</h1>
          <p>Your curated collection of favourite jewellery pieces</p>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-icon">💔</div>
            <h2>Your wishlist is empty</h2>
            <p>Start adding your favourite jewellery pieces to your wishlist!</p>
            <Link to="/products" className="browse-btn">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((item) => {
              const product = item.productDetails || {};
              const productName = getProductName(product);
              const productPrice = getProductPrice(product);
              const productId = product.opentag_id || item.product;
              const imageUrl = getImageUrl(product);
              const wishlistId = item.wishlist_id || item.id;
              const productWeight = getProductWeight(product);

              return (
                <div 
                  key={wishlistId} 
                  className="wishlist-card"
                  onClick={() => handleProductClick(productId)}
                >
                  <div className="wishlist-image-wrapper">
                    <img 
                      src={imageUrl} 
                      alt={productName}
                      className="wishlist-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Jewellery';
                      }}
                    />
                    <button 
                      className="remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist(wishlistId, productName);
                      }}
                      disabled={removingItem[wishlistId]}
                    >
                      {removingItem[wishlistId] ? '⏳' : '✕'}
                    </button>
                    
                    {/* Status Badge */}
                    {product.status && (
                      <span className={`status-badge ${product.status === 'Available' ? 'available' : 'unavailable'}`}>
                        {product.status}
                      </span>
                    )}
                  </div>

                  <div className="wishlist-details">
                    <div className="wishlist-meta">
                      <span className="product-category">{product.category || 'Jewellery'}</span>
                      <span className="product-metal">{product.metal_type || 'Gold'}</span>
                    </div>
                    
                    <h3 className="wishlist-name">{productName}</h3>
                    
                    {product.purity && (
                      <div className="product-purity">
                        💎 Purity: {product.purity}%
                      </div>
                    )}
                    
                    <div className="product-weight">
                      ⚖️ Weight: {productWeight}
                    </div>

                    {product.design_master && (
                      <div className="product-design">
                        🎨 {product.design_master}
                      </div>
                    )}
                    
                    <div className="wishlist-price-row">
                      <div className="wishlist-price">
                        <span className="current-price">
                          ₹{productPrice.toLocaleString(undefined, {maximumFractionDigits: 2})}
                        </span>
                        {product.mrp_price && product.mrp_price > productPrice && (
                          <span className="original-price">
                            ₹{parseFloat(product.mrp_price).toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      <button 
                        className="add-to-cart-wishlist-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, item);
                        }}
                        disabled={product.status !== 'Available'}
                      >
                        {product.status === 'Available' ? '🛒 Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>

                    {/* Additional Details */}
                    {product.pcode_barcode && (
                      <div className="product-code">
                        📋 Code: {product.pcode_barcode}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default WishlistPage;