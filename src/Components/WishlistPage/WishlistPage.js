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

  // Details view state
  const [selectedId, setSelectedId] = useState(null);
  const [showBreakup, setShowBreakup] = useState(false);

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
      setWishlistItems(prev => prev.filter(item => (item.wishlist_id || item.id) !== wishlistId));

      // Close the details view if this item was open
      setSelectedId(prev => (prev === wishlistId ? null : prev));
      setShowBreakup(false);

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

  // Navigate to the full product page (still available from the details view)
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Open / close the in-page details view
  const openDetails = (wishlistId) => {
    setShowBreakup(false);
    setSelectedId(wishlistId);
  };

  const closeDetails = () => {
    setShowBreakup(false);
    setSelectedId(null);
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

  // Availability: treat as available unless the status clearly says otherwise
  const isProductAvailable = (product) => {
    const raw = product && product.status;
    if (raw === undefined || raw === null || String(raw).trim() === '') return true;
    const status = String(raw).trim().toLowerCase();
    const unavailable = ['sold', 'sold out', 'out of stock', 'unavailable', 'inactive', 'not available'];
    return !unavailable.includes(status);
  };

  // ---------- Helpers for the details view ----------

  // Return the first non-empty value among several possible field names
  const pick = (obj, keys) => {
    for (const key of keys) {
      const value = obj ? obj[key] : undefined;
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return value;
      }
    }
    return null;
  };

  const toNumber = (value) => {
    if (value === null || value === undefined) return null;
    const n = parseFloat(String(value).replace(/,/g, ''));
    return Number.isNaN(n) ? null : n;
  };

  const formatINR = (value) => `₹ ${Math.round(value)}`;

  const formatWeight = (value) => {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    return /^[0-9.]+$/.test(text) ? `${text} gram` : text;
  };

  const formatPurity = (value) => {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    return /^[0-9.]+$/.test(text) ? `${text}%` : text;
  };

  // Price breakup rows (only rows we can find in the API data are shown)
  const getPriceBreakup = (product) => {
    const total = getProductPrice(product);

    const stone = toNumber(pick(product, ['stone_charges', 'stone_amount', 'stone_value', 'stone_price']));
    const making = toNumber(pick(product, ['making_charges', 'making_amount', 'va_amount', 'value_added', 'value_addition', 'making']));
    const gst = toNumber(pick(product, ['gst_amount', 'gst_value', 'tax_amount']));
    const gstPercent = pick(product, ['gst_percentage', 'gst_percent']);
    let metal = toNumber(pick(product, ['metal_value', 'gold_value', 'metal_amount', 'gold_amount', 'metal_price']));

    const others = [stone, making, gst].filter(v => v !== null);
    if (metal === null && others.length > 0) {
      const remainder = total - others.reduce((sum, v) => sum + v, 0);
      if (remainder > 0) metal = remainder;
    }

    const metalName = String(product.metal_type || 'Gold').toUpperCase();
    const rows = [];
    if (metal !== null) rows.push({ label: `${metalName} value`, value: metal });
    if (stone !== null) rows.push({ label: 'Stone Charges', value: stone });
    if (making !== null) rows.push({ label: 'Value Added / Making', value: making });
    if (gst !== null) {
      const pct = toNumber(gstPercent);
      rows.push({ label: pct !== null && pct > 0 ? `GST (${pct}%)` : 'GST', value: gst });
    }
    return { rows, total };
  };

  // Specification rows (only rows with a value are shown)
  const getSpecifications = (product, name) => {
    const specs = [
      ['Product Name', name],
      ['Brand Name', pick(product, ['brand_name', 'brand'])],
      ['Product Code', pick(product, ['pcode_barcode', 'product_code', 'barcode'])],
      ['Availability', pick(product, ['status']) || 'Made To Order'],
      ['Product Size', pick(product, ['size', 'product_size', 'ring_size'])],
      ['Product Metal', pick(product, ['metal_type'])],
      ['Product Purity', formatPurity(pick(product, ['purity']))],
      ['Product Colour', pick(product, ['color', 'colour', 'metal_colour', 'metal_color'])],
      ['Gross Weight', formatWeight(pick(product, ['gross_weight']))],
      ['Net Weight', formatWeight(pick(product, ['net_weight']))],
      ['Certified by', pick(product, ['certified_by', 'certification', 'certificate'])],
    ];
    return specs.filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '');
  };

  // The item currently shown in the details view
  const selectedItem = selectedId !== null
    ? wishlistItems.find(i => (i.wishlist_id || i.id) === selectedId)
    : null;

  // Lock page scroll and allow Esc to close while the details view is open
  useEffect(() => {
    if (!selectedItem) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showBreakup) setShowBreakup(false);
        else closeDetails();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, showBreakup]);

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

  // ---------- Details view (bottom of render, shown over the page) ----------
  const renderDetails = () => {
    if (!selectedItem) return null;

    const product = selectedItem.productDetails || {};
    const name = getProductName(product);
    const price = getProductPrice(product);
    const productId = product.opentag_id || selectedItem.product;
    const wishlistId = selectedItem.wishlist_id || selectedItem.id;
    const imageUrl = getImageUrl(product);
    const available = isProductAvailable(product);
    const availabilityLabel = pick(product, ['status']) || 'Made to order';
    const specs = getSpecifications(product, name);
    const breakup = getPriceBreakup(product);
    const description = pick(product, ['description', 'product_description']) ||
      `Introducing ${name}. Elevate your style with this stunning piece, perfect for any occasion. Order yours today and add a touch of elegance to your jewellery collection.`;

    return (
      <div className="wd-overlay" onClick={closeDetails}>
        <div
          className="wd-panel"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} details`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="wd-header">
            <button className="wd-back" onClick={closeDetails} aria-label="Back to wishlist">
              ←
            </button>
            <h2 className="wd-title">{name}</h2>
          </div>

          {/* Image + availability tag */}
          <div className="wd-image-wrap">
            <img
              src={imageUrl}
              alt={name}
              className="wd-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Jewellery';
              }}
            />
            <span className={`wd-tag ${available ? 'wd-tag-ok' : 'wd-tag-warn'}`}>
              {availabilityLabel}
            </span>
          </div>

          {/* Name + price */}
          <div className="wd-info">
            <div className="wd-name">{name}</div>
            <div className="wd-price-row">
              <span className="wd-price">{formatINR(price)}</span>
              <button className="wd-breakup-link" onClick={() => setShowBreakup(true)}>
                View Price Breakup
              </button>
            </div>

            {/* Actions */}
            <div className="wd-actions">
              <button
                className="wd-remove"
                aria-label="Remove from wishlist"
                onClick={() => removeFromWishlist(wishlistId, name)}
                disabled={removingItem[wishlistId]}
              >
                {removingItem[wishlistId] ? '⏳' : '🗑'}
              </button>
              <button
                className="wd-cart"
                onClick={() => addToCart(product, selectedItem)}
                disabled={!available}
              >
                {available ? 'Move to Cart' : 'Out of Stock'}
              </button>
            </div>

            {/* Description */}
            <h3 className="wd-section-title">Description</h3>
            <p className="wd-description">{description}</p>

            {/* Specifications */}
            <h3 className="wd-section-title wd-spec-title">Specifications</h3>
            <div className="wd-specs">
              {specs.map(([label, value]) => (
                <div className="wd-spec-row" key={label}>
                  <span className="wd-spec-label">{label}</span>
                  <span className="wd-spec-value">{String(value)}</span>
                </div>
              ))}
            </div>

            <button className="wd-full-link" onClick={() => handleProductClick(productId)}>
              Open full product page
            </button>
          </div>
        </div>

        {/* Price Breakup bottom sheet */}
        {showBreakup && (
          <div
            className="wd-sheet-layer"
            onClick={(e) => {
              e.stopPropagation();
              setShowBreakup(false);
            }}
          >
            <div className="wd-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="wd-sheet-handle" />
              <h3 className="wd-sheet-title">Price Breakup</h3>
              {breakup.rows.map((row) => (
                <div className="wd-sheet-row" key={row.label}>
                  <span className="wd-sheet-label">{row.label}</span>
                  <span className="wd-sheet-value">{formatINR(row.value)}</span>
                </div>
              ))}
              <div className="wd-sheet-row wd-sheet-total">
                <span className="wd-sheet-label">Total</span>
                <span className="wd-sheet-value">{formatINR(breakup.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
              const imageUrl = getImageUrl(product);
              const wishlistId = item.wishlist_id || item.id;
              const productWeight = getProductWeight(product);
              const available = isProductAvailable(product);

              return (
                <div
                  key={wishlistId}
                  className="wishlist-card"
                  onClick={() => openDetails(wishlistId)}
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
                    {/* Overlay remove button (desktop / tablet) */}
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
                      <span className={`status-badge ${available ? 'available' : 'unavailable'}`}>
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

                      <div className="wishlist-actions">
                        {/* Inline trash button (mobile) */}
                        <button
                          className="remove-btn-inline"
                          aria-label="Remove from wishlist"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWishlist(wishlistId, productName);
                          }}
                          disabled={removingItem[wishlistId]}
                        >
                          {removingItem[wishlistId] ? '⏳' : '🗑'}
                        </button>

                        <button
                          className="add-to-cart-wishlist-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product, item);
                          }}
                          disabled={!available}
                        >
                          {available ? 'Move to Cart' : 'Out of Stock'}
                        </button>
                      </div>
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

      {renderDetails()}

      <Footer />
    </div>
  );
};

export default WishlistPage;