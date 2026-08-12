import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Products.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import baseURL from '../URL/BaseURL';

const Products = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilter, setShowFilter] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const [addedToCart, setAddedToCart] = useState({});
  const [addingToWishlist, setAddingToWishlist] = useState({});
  const [wishlistItems, setWishlistItems] = useState({});
  const [wishlistItemIds, setWishlistItemIds] = useState({});
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratesData, setRatesData] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Get current logged-in customer ID from localStorage or context
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

    console.warn('No customer ID found, using default');
    return 52;
  };

  // Fetch rates from API
  const fetchRates = async () => {
    try {
      setRatesLoading(true);
      const response = await fetch(`${baseURL}/api/current-rates/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the API data into the format expected by the rates ticker
      if (data) {
        // Handle both array and single object response
        let rateData = Array.isArray(data) ? data[0] : data;
        
        // If there's no data or invalid structure, throw error
        if (!rateData || !rateData.current_rates_id) {
          throw new Error('Invalid rate data received');
        }
        
        // Transform to rates display format
        const transformedRates = [
          {
            id: 1,
            metal: 'Gold 24K',
            rate: `₹${parseFloat(rateData.rate_24crt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            purity: '24 Carat',
            color: '#FFD700'
          },
          {
            id: 2,
            metal: 'Gold 22K',
            rate: `₹${parseFloat(rateData.rate_22crt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            purity: '22 Carat',
            color: '#FFC107'
          },
          {
            id: 3,
            metal: 'Gold 18K',
            rate: `₹${parseFloat(rateData.rate_18crt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            purity: '18 Carat',
            color: '#FFB300'
          },
          {
            id: 4,
            metal: 'Silver',
            rate: `₹${parseFloat(rateData.silver_rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            purity: '999 Fine',
            color: '#C0C0C0'
          }
        ];
        
        setRatesData(transformedRates);
        setLastUpdated(new Date().toLocaleString());
      } else {
        throw new Error('No data received from API');
      }
    } catch (err) {
      console.error('Error fetching rates:', err);
      setError('Failed to load rates');
      // Set empty rates array
      setRatesData([]);
    } finally {
      setRatesLoading(false);
    }
  };

  // Initial fetch and auto-refresh rates
  useEffect(() => {
    fetchRates();
    
    // Refresh rates every 5 minutes
    const interval = setInterval(fetchRates, 300000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Add these banner data and schemes data inside your Products component
  const banners = [
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&h=500&fit=crop&crop=center',
      title: 'Latest Diamond Collection',
      subtitle: 'LATEST DIAMOND COLLECTION',
      overlay: 'DIAMOND COLLECTION'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=1200&h=500&fit=crop&crop=center',
      title: 'Gold Jewellery',
      subtitle: 'GOLD JEWELLERY',
      overlay: 'GOLD JEWELLERY'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&h=500&fit=crop&crop=center',
      title: 'Special Offer on Gemstones',
      subtitle: 'SPECIAL OFFER ON GEMSTONES',
      overlay: 'GEMSTONES'
    }
  ];

  // Schemes card data
  const schemes = {
    title: '🎯 EXCLUSIVE SCHEMES',
    subtitle: 'Discover our special jewellery schemes with amazing benefits',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&h=400&fit=crop&crop=center',
    cta: 'View Schemes →'
  };

  // Fetch wishlist items from API
  const fetchWishlistItems = async () => {
    try {
      const currentCustomerId = getCustomerId();

      if (!currentCustomerId) {
        console.warn('No customer ID found, cannot fetch wishlist');
        return {};
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

      const wishlistMap = {};
      const wishlistIdMap = {};

      // Check if response is an array
      if (Array.isArray(data)) {
        // Filter items based on customer ID
        const customerWishlistItems = data.filter(item => item.customer === currentCustomerId);
        console.log('Customer wishlist items:', customerWishlistItems);

        customerWishlistItems.forEach(item => {
          const productId = item.product;
          const wishlistId = item.wishlist_id || item.id;
          if (productId) {
            wishlistMap[productId] = true;
            wishlistIdMap[productId] = wishlistId;
          }
        });
      }
      // If response has data property (nested)
      else if (data && data.data && Array.isArray(data.data)) {
        const customerWishlistItems = data.data.filter(item => item.customer === currentCustomerId);
        console.log('Customer wishlist items (nested):', customerWishlistItems);

        customerWishlistItems.forEach(item => {
          const productId = item.product;
          const wishlistId = item.wishlist_id || item.id;
          if (productId) {
            wishlistMap[productId] = true;
            wishlistIdMap[productId] = wishlistId;
          }
        });
      }

      console.log('Wishlist map for current customer:', wishlistMap);
      console.log('Wishlist ID map:', wishlistIdMap);

      setWishlistItemIds(wishlistIdMap);
      return wishlistMap;
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      return {};
    }
  };

  // Fetch cart items from API
  const fetchCartItems = async () => {
    try {
      const currentCustomerId = getCustomerId();

      if (!currentCustomerId) {
        console.warn('No customer ID found, cannot fetch cart');
        return {};
      }

      const response = await fetch(`${baseURL}/api/cart/?customer_id=${currentCustomerId}`, {
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
      console.log('Cart API Response:', data);

      const cartMap = {};
      if (data && data.items && data.items.length > 0) {
        data.items.forEach(item => {
          const productId = item.product_details?.opentag_id;
          if (productId) {
            cartMap[productId] = true;
          }
        });

        const transformedItems = data.items.map(item => ({
          id: item.product_details.opentag_id,
          cart_item_id: item.cart_item_id,
          name: item.product_details.product_name ||
            `${item.product_details.sub_category} ${item.product_details.prefix || ''}`.trim(),
          category: item.product_details.category || 'Jewellery',
          price: parseFloat(item.unit_price) || 0,
          image: item.product_details.image || '',
          metal: item.product_details.metal_type || 'Gold',
          weight: item.product_details.gross_weight || '0g',
          quantity: item.quantity || 1,
          total_price: parseFloat(item.total_price) || 0,
          purity: item.product_details.purity,
          product_details: item.product_details
        }));
        localStorage.setItem('cart', JSON.stringify(transformedItems));
      }

      return cartMap;
    } catch (err) {
      console.error('Error fetching cart:', err);

      const savedCart = localStorage.getItem('cart');
      const cartMap = {};
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          cartItems.forEach(item => {
            if (item.id) {
              cartMap[item.id] = true;
            }
          });
        } catch (e) {
          console.error('Error parsing localStorage cart:', e);
        }
      }
      return cartMap;
    }
  };

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const productsResponse = await fetch(`${baseURL}/api/opening-tags/`);

        if (!productsResponse.ok) {
          throw new Error(`HTTP error! status: ${productsResponse.status}`);
        }

        const productsData = await productsResponse.json();

        if (productsData.status && productsData.data) {
          // Filter products where is_display is 1 (true) - only display products that should be shown
          const displayableProducts = productsData.data.filter(item => item.is_display === 1);

          const transformedProducts = displayableProducts.map((item, index) => ({
            id: item.opentag_id || index,
            name: item.product_name || `${item.sub_category} ${item.prefix || ''}`.trim(),
            category: item.category || 'Jewellery',
            subCategory: item.sub_category || '',
            price: parseFloat(item.total_price) || 0,
            originalPrice: null,
            image: item.image || getFallbackImage(item.category, item.sub_category),
            rating: 4.0 + Math.random() * 0.9,
            reviews: Math.floor(Math.random() * 200) + 10,
            isNew: item.status === 'Available' ? true : false,
            isGold: item.metal_type === 'GOLD',
            metal: item.metal_type || 'Gold',
            weight: item.gross_weight || '0g',
            description: `${item.sub_category} - ${item.design_master || ''}`,
            inStock: item.status === 'Available',
            purity: item.purity,
            pcode: item.pcode_barcode,
            grossWeight: item.gross_weight,
            makingCharges: item.making_charges,
            tax: item.tax,
            status: item.status,
            stockPoint: item.stock_point,
            designMaster: item.design_master,
            is_display: item.is_display,
            productData: item
          }));

          setProducts(transformedProducts);

          // Fetch cart items and wishlist items in parallel
          const [cartMap, wishlistMap] = await Promise.all([
            fetchCartItems(),
            fetchWishlistItems()
          ]);

          setAddedToCart(cartMap);
          setWishlistItems(wishlistMap);

        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setProducts(getFallbackProducts());

        const [cartMap, wishlistMap] = await Promise.all([
          fetchCartItems(),
          fetchWishlistItems()
        ]);
        setAddedToCart(cartMap);
        setWishlistItems(wishlistMap);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);


  // Auto-scroll banners
  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 4000);

    return () => {
      if (bannerInterval) {
        clearInterval(bannerInterval);
      }
    };
  }, []);

  // Fallback image function
  const getFallbackImage = (category, subCategory) => {
    const imageMap = {
      'GOLD JEWELLERY': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center',
      'SILVER JEWELLERY': 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400&h=400&fit=crop&crop=center',
      'GOLD BRACELETS': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop&crop=center',
      'SILVER PATTI': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop&crop=center'
    };
    return imageMap[category] || imageMap[subCategory] || 'https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Jewellery';
  };

  // Fallback products if API fails
  const getFallbackProducts = () => {
    return [
      {
        id: 1,
        name: 'Diamond Solitaire Ring',
        category: 'Rings',
        price: 24999,
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center',
        rating: 4.8,
        reviews: 124,
        isNew: true,
        isGold: true,
        metal: '18K Gold',
        weight: '3.5g',
        description: 'Elegant diamond solitaire ring with a classic design.',
        inStock: true,
        is_display: 1
      },
      {
        id: 2,
        name: 'Gold Chain Necklace',
        category: 'Necklaces',
        price: 18999,
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop&crop=center',
        rating: 4.5,
        reviews: 89,
        isNew: false,
        isGold: true,
        metal: '22K Gold',
        weight: '12g',
        description: 'Beautiful gold chain necklace with intricate craftsmanship.',
        inStock: true,
        is_display: 1
      },
      {
        id: 3,
        name: 'Pearl Drop Earrings',
        category: 'Earrings',
        price: 7999,
        originalPrice: 12999,
        image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400&h=400&fit=crop&crop=center',
        rating: 4.7,
        reviews: 56,
        isNew: true,
        isGold: false,
        metal: 'Silver',
        weight: '2g',
        description: 'Stunning pearl drop earrings with silver setting.',
        inStock: true,
        is_display: 1
      },
      {
        id: 4,
        name: 'Diamond Tennis Bracelet',
        category: 'Bracelets',
        price: 15999,
        originalPrice: 19999,
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop&crop=center',
        rating: 4.9,
        reviews: 203,
        isNew: false,
        isGold: true,
        metal: '14K Gold',
        weight: '6g',
        description: 'Stunning diamond tennis bracelet with brilliant cut diamonds.',
        inStock: true,
        is_display: 1
      }
    ];
  };

  // Show SweetAlert success popup for cart
  const showSuccessPopup = (productName) => {
    Swal.fire({
      title: '✨ Added to Cart!',
      text: `${productName} has been added to your cart successfully.`,
      icon: 'success',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: true,
      confirmButtonColor: '#C9A84C',
      confirmButtonText: '🛒 View Cart',
      showCancelButton: true,
      cancelButtonColor: '#d33',
      cancelButtonText: 'Continue Shopping',
      background: '#1a1a1a',
      color: '#ffffff',
      backdrop: 'rgba(0,0,0,0.8)',
      customClass: {
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn',
        popup: 'swal-popup-custom'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/cartpage');
      }
    });
  };

  // Show wishlist success popup
  const showWishlistSuccessPopup = (productName) => {
    Swal.fire({
      title: '❤️ Added to Wishlist!',
      text: `${productName} has been added to your wishlist.`,
      icon: 'success',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      background: '#1a1a1a',
      color: '#ffffff',
      backdrop: 'rgba(0,0,0,0.8)'
    });
  };

  // Show wishlist remove popup
  const showWishlistRemovePopup = (productName) => {
    Swal.fire({
      title: '💔 Removed from Wishlist',
      text: `${productName} has been removed from your wishlist.`,
      icon: 'info',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      background: '#1a1a1a',
      color: '#ffffff',
      backdrop: 'rgba(0,0,0,0.8)'
    });
  };

  // Show error popup
  const showErrorPopup = (errorMessage) => {
    Swal.fire({
      title: '❌ Error!',
      text: errorMessage || 'Something went wrong. Please try again.',
      icon: 'error',
      confirmButtonColor: '#d33',
      confirmButtonText: 'OK',
      background: '#1a1a1a',
      color: '#ffffff',
      backdrop: 'rgba(0,0,0,0.8)'
    });
  };

  // Add to cart handler with POST API
  const addToCart = async (e, product) => {
    e.stopPropagation();

    setAddingToCart(prev => ({ ...prev, [product.id]: true }));

    try {
      const currentCustomerId = getCustomerId();
      const unitPrice = product.productData?.total_price || product.price.toString();

      const cartData = {
        customer: currentCustomerId,
        quantity: 1,
        unit_price: parseFloat(unitPrice).toFixed(2),
        discount: "0",
        gst_percentage: "0",
        gst_amount: "0",
        total_price: parseFloat(unitPrice).toFixed(2),
        product: product.id
      };

      console.log('Sending to cart API:', cartData);

      const response = await fetch(`${baseURL}/api/cart/add-item/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(cartData)
      });

      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      if (responseData.status === 'success') {
        setAddedToCart(prev => ({ ...prev, [product.id]: true }));

        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = existingCart.find(item => item.id === product.id);

        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          existingCart.push({
            ...product,
            quantity: 1,
            cartItemId: responseData.data?.cart_item_id
          });
        }

        localStorage.setItem('cart', JSON.stringify(existingCart));
        showSuccessPopup(product.name);
      } else {
        throw new Error(responseData.message || 'Failed to add item to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      showErrorPopup(err.message || 'Failed to add item to cart');

      try {
        const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = existingCart.find(item => item.id === product.id);

        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          existingCart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem('cart', JSON.stringify(existingCart));
        setAddedToCart(prev => ({ ...prev, [product.id]: true }));
        showSuccessPopup(product.name + ' (Offline Mode)');
      } catch (localErr) {
        console.error('Error saving to localStorage:', localErr);
        showErrorPopup('Failed to add item to cart');
      }
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  // Add to wishlist handler
  const addToWishlist = async (e, product) => {
    e.stopPropagation();

    // If already in wishlist, remove it
    if (wishlistItems[product.id]) {
      await removeFromWishlist(e, product);
      return;
    }

    setAddingToWishlist(prev => ({ ...prev, [product.id]: true }));

    try {
      const currentCustomerId = getCustomerId();

      if (!currentCustomerId) {
        showErrorPopup('Please login to add items to wishlist');
        setAddingToWishlist(prev => ({ ...prev, [product.id]: false }));
        return;
      }

      const wishlistData = {
        customer: currentCustomerId,
        product: product.id
      };

      console.log('Sending to wishlist API:', wishlistData);

      const response = await fetch(`${baseURL}/api/wishlist/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(wishlistData)
      });

      let responseData;
      try {
        const text = await response.text();
        responseData = text ? JSON.parse(text) : {};
        console.log('Wishlist response:', responseData);
      } catch (e) {
        console.error('Error parsing response:', e);
        responseData = {};
      }

      if (!response.ok) {
        const errorMsg = responseData.non_field_errors?.join(', ') ||
          responseData.message ||
          responseData.error ||
          Object.values(responseData).flat().join(', ') ||
          `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
      }

      if (responseData.status === 'success' || responseData.message || responseData.id) {
        // Get the wishlist ID from the response
        const wishlistId = responseData.wishlist_id || responseData.id;
        console.log('Wishlist ID from response:', wishlistId);

        // Update wishlist state
        setWishlistItems(prev => ({ ...prev, [product.id]: true }));
        setWishlistItemIds(prev => ({ ...prev, [product.id]: wishlistId }));

        showWishlistSuccessPopup(product.name);
      } else {
        throw new Error(responseData.message || 'Failed to add to wishlist');
      }
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      showErrorPopup(err.message || 'Failed to add to wishlist');
    } finally {
      setAddingToWishlist(prev => ({ ...prev, [product.id]: false }));
    }
  };

  // Remove from wishlist using DELETE API
  const removeFromWishlist = async (e, product) => {
    e.stopPropagation();

    setAddingToWishlist(prev => ({ ...prev, [product.id]: true }));

    try {
      const currentCustomerId = getCustomerId();

      if (!currentCustomerId) {
        showErrorPopup('Please login to manage wishlist');
        setAddingToWishlist(prev => ({ ...prev, [product.id]: false }));
        return;
      }

      // Get the wishlist ID from state or fetch it
      let wishlistId = wishlistItemIds[product.id];

      // If not in state, fetch it from API
      if (!wishlistId) {
        console.log('Wishlist ID not in state, fetching from API...');
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
        console.log('Wishlist data for removal:', data);

        let items = [];
        if (Array.isArray(data)) {
          items = data;
        } else if (data && data.data && Array.isArray(data.data)) {
          items = data.data;
        }

        // Find the wishlist item for this product and customer
        const wishlistItem = items.find(item =>
          item.product === product.id &&
          item.customer === currentCustomerId
        );

        if (wishlistItem) {
          wishlistId = wishlistItem.wishlist_id || wishlistItem.id;
          console.log('Found wishlist item to delete:', wishlistItem);
        }
      }

      if (!wishlistId) {
        throw new Error('Wishlist item not found');
      }

      console.log(`Deleting wishlist item with ID: ${wishlistId}`);

      // Delete the wishlist item using the DELETE API
      const deleteResponse = await fetch(`${baseURL}/api/wishlist/${wishlistId}/`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!deleteResponse.ok) {
        throw new Error(`HTTP error! status: ${deleteResponse.status}`);
      }

      // Update wishlist state
      setWishlistItems(prev => {
        const newState = { ...prev };
        delete newState[product.id];
        return newState;
      });

      setWishlistItemIds(prev => {
        const newState = { ...prev };
        delete newState[product.id];
        return newState;
      });

      showWishlistRemovePopup(product.name);
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      showErrorPopup(err.message || 'Failed to remove from wishlist');
    } finally {
      setAddingToWishlist(prev => ({ ...prev, [product.id]: false }));
    }
  };

  // Categories for filter
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filter products based on selected category
  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(product => product.category === selectedCategory);

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  // Navigate to product detail
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Render star rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <>
        {'★'.repeat(fullStars)}
        {hasHalfStar && '★'}
        {'☆'.repeat(emptyStars)}
      </>
    );
  };

  // Loading state
  if (loading || ratesLoading) {
    return (
      <div>
        <Navbar />
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading our exquisite collection...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="error-container">
          <h2>😕 Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="products-page">

        {/* Search Bar */}
        <div className="search-bar-container">
          <div className="search-bar-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search for Jewellery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-button">
              <span>🔍</span>
            </button>
          </div>
        </div>

        {/* Gold & Silver Rates Ticker */}
        {ratesData.length > 0 ? (
          <div className="rates-ticker-product">
            <div className="rates-ticker-product-container">
              <div className="rates-ticker-product-content">
                {ratesData.map((rate, index) => (
                  <div key={rate.id} className="rate-item">
                    <span className="rate-metal" style={{ color: rate.color }}>
                      {rate.metal}
                    </span>
                    <span className="rate-purity">({rate.purity})</span>
                    <span className="rate-value">{rate.rate}</span>
                    {index < ratesData.length - 1 && (
                      <span className="rate-divider">|</span>
                    )}
                  </div>
                ))}
                {/* Duplicate for seamless scrolling */}
                {ratesData.map((rate, index) => (
                  <div key={`dup-${rate.id}`} className="rate-item">
                    <span className="rate-metal" style={{ color: rate.color }}>
                      {rate.metal}
                    </span>
                    <span className="rate-purity">({rate.purity})</span>
                    <span className="rate-value">{rate.rate}</span>
                    {index < ratesData.length - 1 && (
                      <span className="rate-divider">|</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {lastUpdated && (
              <div className="rates-last-updated">
                {/* <span>🔹 Last updated: {lastUpdated}</span> */}
              </div>
            )}
          </div>
        ) : (
          <div className="rates-error">
            <span>⚠️ Unable to load current rates. Please try again later.</span>
          </div>
        )}

        {/* Banner Slider */}
        <div className="banner-slider-product">
          <div className="banner-wrapper">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`banner-slide ${index === currentBannerIndex ? 'active' : ''}`}
              >
                <img src={banner.image} alt={banner.title} className="banner-image" />
                <div className="banner-overlay">
                  <h2>{banner.overlay}</h2>
                  <p>{banner.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Banner Dots */}
          <div className="banner-dots">
            {banners.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === currentBannerIndex ? 'active' : ''}`}
                onClick={() => setCurrentBannerIndex(index)}
              />
            ))}
          </div>
        </div>

        {/* Schemes Card - Single card replacing gold/silver collections */}
        <div className="schemes-section">
          <div
            className="schemes-card"
            onClick={() => navigate('/allschemes')}
          >
            <img src={schemes.image} alt={schemes.title} className="schemes-image" />
            <div className="schemes-overlay">
              <h3>{schemes.title}</h3>
              <p>{schemes.subtitle}</p>
              <span className="schemes-cta">{schemes.cta}</span>
            </div>
          </div>
        </div>
        {/* Header */}
        <div className="products-header">
          <h1>✨ Our Collection</h1>
          <p>Discover exquisite jewellery pieces crafted with perfection</p>
        </div>

        {/* Filter and Sort Bar */}
        <div className="filter-bar">
          <div className="filter-section">
            <button
              className="filter-toggle"
              onClick={() => setShowFilter(!showFilter)}
            >
              <span>☰</span> Categories
            </button>

            <div className={`category-filters ${showFilter ? 'show' : ''}`}>
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowFilter(false);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="sort-section">
            <label htmlFor="sort">Sort by:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="popular">Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="results-count">
          Showing {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {sortedProducts.map(product => {
            const isAdded = addedToCart[product.id] || false;
            const isInWishlist = wishlistItems[product.id] || false;
            const isAddingToWishlist = addingToWishlist[product.id] || false;

            return (
              <div
                key={product.id}
                className="product-card"
                onClick={() => handleProductClick(product.id)}
              >
                {/* Product Image */}
                <div className="product-image-wrapper">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Jewellery';
                    }}
                  />
                  {product.isNew && (
                    <span className="badge-new">NEW</span>
                  )}
                  {product.originalPrice && (
                    <span className="badge-discount">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  )}
                  {product.inStock && (
                    <span className="badge-instock">In Stock</span>
                  )}
                  {isAdded && (
                    <span className="badge-added">✓ Added</span>
                  )}
                </div>

                {/* Product Details */}
                <div className="product-details">
                  <div className="product-meta">
                    {/* <span className="product-category">{product.category}</span>
                    <span className="product-metal">{product.metal}</span> */}
                  </div>

                  <h3 className="product-name">{product.name || product.subCategory}</h3>

                  <div className="product-weight">
                    ⚖️ Weight: {product.weight}
                  </div>

                  <div className="product-price-row">
                    <div className="product-price">
                      <span className="current-price">₹{product.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      {product.originalPrice && (
                        <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>

                    <div className="product-actions-row">
                      <button
                        className={`add-to-cart-btn ${isAdded ? 'added' : ''} ${addingToCart[product.id] ? 'loading' : ''}`}
                        onClick={(e) => addToCart(e, product)}
                        disabled={!product.inStock || addingToCart[product.id] || isAdded}
                        aria-label={isAdded ? 'Added to cart' : 'Add to cart'}
                      >
                        {addingToCart[product.id] ? (
                          <span>⏳</span>
                        ) : isAdded ? (
                          <span>✓</span>
                        ) : (
                          <span>🛒</span>
                        )}
                      </button>

                      <button
                        className={`wishlist-btn ${isInWishlist ? 'active' : ''} ${isAddingToWishlist ? 'loading' : ''}`}
                        onClick={(e) => addToWishlist(e, product)}
                        disabled={isAddingToWishlist}
                        aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        {isAddingToWishlist ? (
                          <span className="wishlist-spinner">⏳</span>
                        ) : (
                          <span className="wishlist-icon">{isInWishlist ? '❤️' : '🤍'}</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {sortedProducts.length === 0 && (
          <div className="empty-state">
            <p>No products found in this category</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Products;