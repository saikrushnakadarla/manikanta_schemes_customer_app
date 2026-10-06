import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Products.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import BottomNav from '../Navbar/Bottomnav';
import baseURL from '../URL/BaseURL';

// ---- Adjust these routes to match your app ----
const ROUTES = {
  rewards: '/rewards',
  schemes: '/allschemes'
};

const MORE_OPTIONS = [
  { id: 'inst', label: 'Installment Plan', icon: '🗓️', tone: 'green', route: ROUTES.schemes }
];

const PRODUCTS_PREVIEW_COUNT = 6;

// ===== Rate Chart Component =====
const RateChart = ({ carat, onClose }) => {
  const [period, setPeriod] = useState('6M');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [caratName, setCaratName] = useState('');

  const periods = ['1W', '1M', '6M', '1Y', 'ALL'];

  useEffect(() => {
    fetchChartData(period);
  }, [period, carat]);

  const fetchChartData = async (selectedPeriod) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${baseURL}/api/rates/?period=${selectedPeriod}&carat=${carat}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        setChartData(data.data);
        setCaratName(data.carat_name || carat);
      } else {
        setChartData([]);
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError(err.message);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // Format date as "21 September 2026"
  const formatChartDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'long' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Format price as "₹15123.00"
  const formatPrice = (value) => {
    return `₹${parseFloat(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Format change as "+₹823.0" or "-₹200.0"
  const formatChange = (value) => {
    const num = parseFloat(value);
    const sign = num >= 0 ? '+' : '';
    return `${sign}₹${Math.abs(num).toFixed(1)}`;
  };

  // Prepare chart data for SVG path
  const getChartPoints = () => {
    if (chartData.length === 0) return { path: '', areaPath: '', min: 0, max: 0, yLabels: [] };

    const rates = chartData.map(d => parseFloat(d.rate));
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    const range = maxRate - minRate || 1;
    const padding = range * 0.15;

    const chartMin = Math.max(0, minRate - padding);
    const chartMax = maxRate + padding;
    const chartRange = chartMax - chartMin || 1;

    const width = 100;
    const height = 100;

    const points = chartData.map((d, i) => {
      const x = (i / (chartData.length - 1 || 1)) * width;
      const y = height - ((parseFloat(d.rate) - chartMin) / chartRange) * height;
      return { x, y, rate: parseFloat(d.rate), date: d.date };
    });

    // Create path for line
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }

    // Create area path (fill under line)
    const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;

    // Y-axis labels (4 labels)
    const yLabels = [];
    for (let i = 0; i < 4; i++) {
      const value = chartMax - (chartRange / 3) * i;
      yLabels.push(Math.round(value));
    }

    return { path, areaPath, min: chartMin, max: chartMax, yLabels, points };
  };

  const chart = getChartPoints();

  // Reverse for display (newest first)
  const displayData = [...chartData].reverse();

  return (
    <div className="rate-chart-overlay" onClick={onClose}>
      <div className="rate-chart-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="rate-chart-header">
          <button className="rate-chart-back" onClick={onClose} aria-label="Go back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h2 className="rate-chart-title">
            {caratName || `${carat} Rate Chart`}
          </h2>
        </div>

        {/* Period Selector */}
        <div className="rate-chart-periods">
          {periods.map((p) => (
            <button
              key={p}
              className={`rate-chart-period-btn ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chart Area */}
        <div className="rate-chart-area">
          {loading ? (
            <div className="rate-chart-loading">
              <div className="rate-chart-spinner"></div>
              <p>Loading chart data...</p>
            </div>
          ) : error ? (
            <div className="rate-chart-error">
              <p>⚠️ {error}</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="rate-chart-empty">
              <p>No data available for this period</p>
            </div>
          ) : (
            <div className="rate-chart-svg-wrapper">
              {/* Y-axis labels */}
              <div className="rate-chart-y-labels">
                {chart.yLabels.map((label, i) => (
                  <span key={i} className="rate-chart-y-label">
                    {label.toLocaleString('en-IN')}
                  </span>
                ))}
              </div>

              {/* Chart SVG */}
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="rate-chart-svg"
              >
                {/* Grid lines */}
                {[0, 33.33, 66.66, 100].map((y, i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={y}
                    x2="100"
                    y2={y}
                    stroke="#2a2a2a"
                    strokeWidth="0.3"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {[0, 25, 50, 75, 100].map((x, i) => (
                  <line
                    key={i}
                    x1={x}
                    y1="0"
                    x2={x}
                    y2="100"
                    stroke="#2a2a2a"
                    strokeWidth="0.3"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}

                {/* Area fill */}
                <path
                  d={chart.areaPath}
                  fill="url(#rateChartGradient)"
                  opacity="0.35"
                />

                {/* Line */}
                <path
                  d={chart.path}
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="0.8"
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />

                {/* Gradient definition */}
                <defs>
                  <linearGradient id="rateChartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#4CAF50" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}
        </div>

        {/* Rate History List */}
        {!loading && !error && displayData.length > 0 && (
          <div className="rate-chart-history">
            {displayData.map((item, index) => {
              const changeNum = parseFloat(item.change) || 0;
              const changeType = item.change_type || 'no_change';
              const isIncrease = changeType === 'increase' || changeNum > 0;
              const isDecrease = changeType === 'decrease' || changeNum < 0;
              const isNoChange = changeType === 'no_change' || changeNum === 0;

              return (
                <div key={item.rates_id || index} className="rate-chart-history-item">
                  <div className="rate-chart-history-row">
                    <div className="rate-chart-history-left">
                      <span className={`rate-chart-arrow ${isIncrease ? 'up' : isDecrease ? 'down' : 'flat'}`}>
                        {isIncrease ? '▲' : isDecrease ? '▼' : '●'}
                      </span>
                      <span className="rate-chart-history-date">
                        {formatChartDate(item.date)}
                      </span>
                    </div>
                    <div className="rate-chart-history-right">
                      <span className="rate-chart-history-price">
                        {formatPrice(item.rate)}
                      </span>
                    </div>
                  </div>
                  <div className="rate-chart-history-row sub">
                    <span className="rate-chart-history-change-label">
                      {isIncrease ? 'Price increased by' : isDecrease ? 'Price decreased by' : 'No Price Change'}
                    </span>
                    <span className={`rate-chart-history-change-value ${isIncrease ? 'up' : isDecrease ? 'down' : 'flat'}`}>
                      {isNoChange ? '₹0' : formatChange(item.change)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ===== Main Products Component =====
const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const productsSectionRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
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
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Rate chart state
  const [showRateChart, setShowRateChart] = useState(false);
  const [selectedRateCarat, setSelectedRateCarat] = useState(null);

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

  // Reward points from the logged-in user (falls back to 0)
  const getRewardPoints = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const pts = user.reward_points ?? user.rewardPoints ?? user.points ?? 0;
      return Number(pts) || 0;
    } catch (e) {
      return 0;
    }
  };

  // Format "03 September, 06:01 pm"
  const formatUpdated = (value) => {
    const d = value ? new Date(value) : new Date();
    const date = isNaN(d.getTime()) ? new Date() : d;
    const day = date.toLocaleString('en-GB', { day: '2-digit' });
    const month = date.toLocaleString('en-GB', { month: 'long' });
    const time = date
      .toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      .toLowerCase();
    return `${day} ${month}, ${time}`;
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

      if (data) {
        let rateData = Array.isArray(data) ? data[0] : data;

        if (!rateData || !rateData.current_rates_id) {
          throw new Error('Invalid rate data received');
        }

        const fmt = (v) =>
          `₹${parseFloat(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const updated = formatUpdated(rateData.updated_at || rateData.created_at || rateData.date);

        const transformedRates = [
          { id: 1, metal: 'Gold', rate: fmt(rateData.rate_24crt), purity: '24K (999)', tone: 'blue', icon: '🪙', gst: '', updated, carat: '24K', caratName: '24K (999)' },
          { id: 2, metal: 'Gold', rate: fmt(rateData.rate_22crt), purity: '22K (916)', tone: 'pink', icon: '🪙', gst: '', updated, carat: '22K', caratName: '22K (916)' },
          { id: 3, metal: 'Gold', rate: fmt(rateData.rate_18crt), purity: '18K (750)', tone: 'green', icon: '🪙', gst: '+3% GST', updated, carat: '18K', caratName: '18K (750)' },
          { id: 4, metal: 'Silver', rate: fmt(rateData.silver_rate), purity: '999 Fine', tone: 'yellow', icon: '🥈', gst: '+3% GST', updated, carat: 'Silver', caratName: 'Silver (999 Fine)' }
        ];

        setRatesData(transformedRates);
        setLastUpdated(new Date().toLocaleString());
      } else {
        throw new Error('No data received from API');
      }
    } catch (err) {
      console.error('Error fetching rates:', err);
      setError('Failed to load rates');
      setRatesData([]);
    } finally {
      setRatesLoading(false);
    }
  };

  // Initial fetch and auto-refresh rates
  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 300000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Banner data
  const banners = [
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&h=800&fit=crop&crop=center',
      title: 'Latest Diamond Collection',
      subtitle: 'LATEST DIAMOND COLLECTION',
      overlay: 'DIAMOND COLLECTION'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=1200&h=800&fit=crop&crop=center',
      title: 'Gold Jewellery',
      subtitle: 'GOLD JEWELLERY',
      overlay: 'GOLD JEWELLERY'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&h=800&fit=crop&crop=center',
      title: 'Special Offer on Gemstones',
      subtitle: 'SPECIAL OFFER ON GEMSTONES',
      overlay: 'GEMSTONES'
    }
  ];

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

      if (Array.isArray(data)) {
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
        const wishlistId = responseData.wishlist_id || responseData.id;
        console.log('Wishlist ID from response:', wishlistId);

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

      let wishlistId = wishlistItemIds[product.id];

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

  // Sub categories (with a representative image) for the category tiles
  const subCategoryTiles = (() => {
    const map = new Map();
    products.forEach(p => {
      const key = p.subCategory || p.category;
      if (key && !map.has(key)) {
        map.set(key, { name: key, category: p.category, image: p.image });
      }
    });
    return Array.from(map.values());
  })();

  // Sub categories available under the selected category (for the "More" sheet)
  const visibleSubCategories = subCategoryTiles.filter(
    s => selectedCategory === 'All' || s.category === selectedCategory
  );

  // Filter products by category, sub category and search
  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'All' && product.category !== selectedCategory) return false;
    if (selectedSubCategory !== 'All' && (product.subCategory || product.category) !== selectedSubCategory) return false;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const haystack = `${product.name} ${product.category} ${product.subCategory}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  const isFiltering =
    selectedCategory !== 'All' || selectedSubCategory !== 'All' || searchQuery.trim() !== '';

  const displayedProducts =
    showAllProducts || isFiltering ? sortedProducts : sortedProducts.slice(0, PRODUCTS_PREVIEW_COUNT);

  // Top trending = highest rated products
  const trendingProducts = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);

  // Navigate to product detail
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const scrollToProducts = () => {
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectSubCategory = (sub) => {
    setSelectedSubCategory(sub.name);
    setSelectedCategory(sub.category);
    setShowFilter(false);
    setTimeout(scrollToProducts, 50);
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory('All');
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedSubCategory('All');
    setSearchQuery('');
    setShowSearch(false);
  };

  // Handle rate card click
  const handleRateCardClick = (rate) => {
    setSelectedRateCarat(rate.carat);
    setShowRateChart(true);
  };

  // Apply filters coming from the sidebar / bottom nav (?category=..&sub=..&search=1)
  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    const sub = params.get('sub');
    const wantsSearch = params.get('search');

    if (cat || sub) {
      setSelectedCategory(cat || 'All');
      setSelectedSubCategory(sub || 'All');
      setShowAllProducts(false);
      setShowSearch(false);
      setSearchQuery('');
      setTimeout(scrollToProducts, 150);
    } else if (wantsSearch) {
      setShowSearch(true);
      setTimeout(() => {
        scrollToProducts();
        if (searchInputRef.current) searchInputRef.current.focus();
      }, 250);
    }
  }, [location.key, location.search, loading]);

  // Product info line like the app: "76.000 Grams - 22K (916)" or price
  const renderProductInfo = (product) => {
    const weightNum = parseFloat(product.grossWeight);
    if (product.grossWeight && !isNaN(weightNum) && weightNum > 0) {
      return (
        <p className="pc-info">
          {product.grossWeight} Grams{product.purity ? ` - ${product.purity}` : ''}
        </p>
      );
    }
    return (
      <p className="pc-info">
        ₹ {product.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        {product.originalPrice && (
          <span className="pc-original">₹{product.originalPrice.toLocaleString()}</span>
        )}
      </p>
    );
  };

  // Reusable product card
  const renderProductCard = (product, keyPrefix = '') => {
    const isAdded = addedToCart[product.id] || false;
    const isInWishlist = wishlistItems[product.id] || false;
    const isAddingToWishlist = addingToWishlist[product.id] || false;

    return (
      <div
        key={`${keyPrefix}${product.id}`}
        className="product-card"
        onClick={() => handleProductClick(product.id)}
      >
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
        </div>

        <div className="product-details">
          <div className="pc-text">
            <h3 className="product-name">{product.name || product.subCategory}</h3>
            {renderProductInfo(product)}
          </div>

          <div className="pc-actions">
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
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading || (ratesLoading && ratesData.length === 0)) {
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

  const tilesToShow = subCategoryTiles.slice(0, 3);

  return (
    <div>
      <Navbar />
      <div className="products-page">

        {/* Small reward banner */}
        <button className="reward-banner" onClick={() => navigate(ROUTES.rewards)}>
          <span className="reward-gift-box">🎁</span>
          <span className="reward-text">
            <span className="reward-label">Total Reward Points</span>
            <span className="reward-points">{getRewardPoints()} Points</span>
          </span>
          <span className="reward-art" aria-hidden="true">🎁</span>
          <span className="reward-arrow">›</span>
        </button>

        {/* 2. Categories / sub categories */}
        <section className="category-tiles">
          {tilesToShow.map(sub => (
            <button
              key={sub.name}
              className={`category-tile ${selectedSubCategory === sub.name ? 'active' : ''}`}
              onClick={() => handleSelectSubCategory(sub)}
            >
              <span className="category-tile-img">
                <img
                  src={sub.image}
                  alt={sub.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200x200/FFD700/FFFFFF?text=Jewellery';
                  }}
                />
              </span>
              <span className="category-tile-label">{sub.name}</span>
            </button>
          ))}
          <button
            className="category-tile"
            onClick={() => setShowFilter(true)}
            aria-label="More categories"
          >
            <span className="category-tile-img more">
              <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="#fff" strokeWidth="1.8">
                <rect x="3" y="3" width="7.5" height="7.5" rx="1.8" />
                <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8" />
                <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8" />
                <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8" />
              </svg>
            </span>
            <span className="category-tile-label">More</span>
          </button>
        </section>

        {/* 3. Metal rates */}
        <section className="section-block">
          <h2 className="section-title">Metal Rates</h2>
          {ratesData.length > 0 ? (
            <div className="rates-scroll">
              {ratesData.map(rate => (
                <div
                  key={rate.id}
                  className={`rate-card tone-${rate.tone}`}
                  onClick={() => handleRateCardClick(rate)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="rate-card-top">
                    <span className="rate-icon">{rate.icon}</span>
                    <div className="rate-names">
                      <span className="rate-metal">{rate.metal}</span>
                      <span className="rate-purity">{rate.purity}</span>
                    </div>
                  </div>
                  <div className="rate-value">{rate.rate}</div>
                  <div className="rate-gst">{rate.gst}</div>
                  <div className="rate-updated">Updated: {rate.updated}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rates-error">
              <span>⚠️ Unable to load current rates. Please try again later.</span>
            </div>
          )}
          {lastUpdated && <span className="visually-hidden">Rates refreshed {lastUpdated}</span>}
        </section>

        {/* 4. More options (schemes = installment plan etc.) */}
        <section className="section-block">
          <h2 className="section-title">More Options</h2>
          <div className="options-grid">
            {MORE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                className={`option-card tone-${opt.tone}`}
                onClick={() => navigate(opt.route)}
              >
                <span className="option-icon">{opt.icon}</span>
                <span className="option-label">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Banner (above products) */}
        <section className="banner-slider-product">
          <div className="banner-wrapper">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`banner-slide ${index === currentBannerIndex ? 'active' : ''}`}
              >
                <img src={banner.image} alt={banner.title} className="banner-image" />
              </div>
            ))}
          </div>
          <div className="banner-counter-row">
            <span className="banner-counter">
              {currentBannerIndex + 1}/{banners.length}
            </span>
          </div>
        </section>

        {/* 5. Products */}
        <section className="section-block" ref={productsSectionRef}>
          <div className="section-head">
            <h2 className="section-title">All Products</h2>
            <div className="head-actions">
              <button
                className="head-search-btn"
                aria-label="Search products"
                onClick={() => {
                  setShowSearch(true);
                  setTimeout(() => searchInputRef.current && searchInputRef.current.focus(), 100);
                }}
              >
                🔍
              </button>
            <button
              className="view-all"
              onClick={() => {
                if (isFiltering) {
                  clearFilters();
                } else {
                  setShowAllProducts(prev => !prev);
                }
              }}
            >
              {isFiltering ? 'Clear ✕' : showAllProducts ? 'Show Less <' : 'View All >'}
            </button>
            </div>
          </div>

          {/* Search (opened from the Search tab / search icon) */}
          {showSearch && (
            <div className="search-bar-wrapper">
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder="Search for Jewellery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="search-button"
                aria-label="Close search"
                onClick={() => {
                  setSearchQuery('');
                  setShowSearch(false);
                }}
              >
                <span>✕</span>
              </button>
            </div>
          )}

          <div className="products-grid">
            {displayedProducts.map(product => renderProductCard(product))}
          </div>

          {sortedProducts.length === 0 && (
            <div className="empty-state">
              <p>No products found</p>
            </div>
          )}
        </section>

        {/* Top trending */}
        {trendingProducts.length > 0 && !isFiltering && (
          <section className="section-block">
            <div className="section-head">
              <h2 className="section-title">Top Trending</h2>
              <button
                className="view-all"
                onClick={() => {
                  setSortBy('rating');
                  setShowAllProducts(true);
                  scrollToProducts();
                }}
              >
                View All &gt;
              </button>
            </div>
            <div className="products-grid">
              {trendingProducts.map(product => renderProductCard(product, 'trend-'))}
            </div>
          </section>
        )}
      </div>

      {/* Categories bottom sheet (opened by "More") */}
      {showFilter && (
        <div className="sheet-backdrop" onClick={() => setShowFilter(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-head">
              <h3>Categories</h3>
              <button className="sheet-close" onClick={() => setShowFilter(false)} aria-label="Close">✕</button>
            </div>

            <div className="category-filters">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleSelectCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <h4 className="sheet-sub-title">Sub Categories</h4>
            <div className="sheet-tiles">
              {visibleSubCategories.map(sub => (
                <button
                  key={sub.name}
                  className={`category-tile ${selectedSubCategory === sub.name ? 'active' : ''}`}
                  onClick={() => handleSelectSubCategory(sub)}
                >
                  <span className="category-tile-img">
                    <img
                      src={sub.image}
                      alt={sub.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x200/FFD700/FFFFFF?text=Jewellery';
                      }}
                    />
                  </span>
                  <span className="category-tile-label">{sub.name}</span>
                </button>
              ))}
            </div>

            <h4 className="sheet-sub-title">Sort by</h4>
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

            <div className="sheet-actions">
              <button className="sheet-clear" onClick={clearFilters}>Clear all</button>
              <button
                className="sheet-apply"
                onClick={() => {
                  setShowFilter(false);
                  setTimeout(scrollToProducts, 50);
                }}
              >
                Show products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Chart Overlay */}
      {showRateChart && (
        <RateChart
          carat={selectedRateCarat}
          onClose={() => setShowRateChart(false)}
        />
      )}

      <Footer />

      {/* Fixed bottom navigation: Home, Search, Chat, Profile */}
      <BottomNav />
    </div>
  );
};

export default Products;