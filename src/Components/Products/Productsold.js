// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './Products.css';
// import Navbar from '../Navbar/Navbar';
// import Footer from '../Footer/Footer';

// const Products = () => {
//   const navigate = useNavigate();
//   const [selectedCategory, setSelectedCategory] = useState('All');
//   const [sortBy, setSortBy] = useState('popular');
//   const [showFilter, setShowFilter] = useState(false);

//   // Sample jewellery products data with realistic image URLs
//   const products = [
//     {
//       id: 1,
//       name: 'Diamond Solitaire Ring',
//       category: 'Rings',
//       price: 24999,
//     //   originalPrice: 34999,
//       image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center',
//       rating: 4.8,
//       reviews: 124,
//       isNew: true,
//       isGold: true,
//       metal: '18K Gold',
//       weight: '3.5g',
//       description: 'Elegant diamond solitaire ring with a classic design. Perfect for engagements and special occasions.',
//       inStock: true
//     },
//     {
//       id: 2,
//       name: 'Gold Chain Necklace',
//       category: 'Necklaces',
//       price: 18999,
//       originalPrice: null,
//       image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop&crop=center',
//       rating: 4.5,
//       reviews: 89,
//       isNew: false,
//       isGold: true,
//       metal: '22K Gold',
//       weight: '12g',
//       description: 'Beautiful gold chain necklace with intricate craftsmanship. Adds elegance to any outfit.',
//       inStock: true
//     },
//     {
//       id: 3,
//       name: 'Pearl Drop Earrings',
//       category: 'Earrings',
//       price: 7999,
//       originalPrice: 12999,
//       image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400&h=400&fit=crop&crop=center',
//       rating: 4.7,
//       reviews: 56,
//       isNew: true,
//       isGold: false,
//       metal: 'Silver',
//       weight: '2g',
//       description: 'Stunning pearl drop earrings with silver setting. Perfect for weddings and parties.',
//       inStock: true
//     },
//     {
//       id: 4,
//       name: 'Diamond Tennis Bracelet',
//       category: 'Bracelets',
//       price: 15999,
//       originalPrice: 19999,
//       image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop&crop=center',
//       rating: 4.9,
//       reviews: 203,
//       isNew: false,
//       isGold: true,
//       metal: '14K Gold',
//       weight: '6g',
//       description: 'Stunning diamond tennis bracelet with brilliant cut diamonds. A timeless piece.',
//       inStock: true
//     },
//     {
//       id: 5,
//       name: 'Gold Mangalsutra',
//       category: 'Necklaces',
//       price: 29999,
//       originalPrice: null,
//       image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&h=400&fit=crop&crop=center',
//       rating: 4.6,
//       reviews: 178,
//       isNew: false,
//       isGold: true,
//       metal: '22K Gold',
//       weight: '15g',
//       description: 'Traditional gold mangalsutra with black beads. An essential piece for married women.',
//       inStock: true
//     },
//     {
//       id: 6,
//       name: 'Diamond Stud Earrings',
//       category: 'Earrings',
//       price: 4999,
//     //   originalPrice: 7999,
//       image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop&crop=center',
//       rating: 4.3,
//       reviews: 67,
//       isNew: true,
//       isGold: false,
//       metal: 'Silver',
//       weight: '1g',
//       description: 'Classic diamond stud earrings in silver setting. Perfect for everyday elegance.',
//       inStock: true
//     },
//     {
//       id: 7,
//       name: 'Gold Engagement Ring',
//       category: 'Rings',
//       price: 34999,
//     //   originalPrice: 45999,
//       image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&crop=center',
//       rating: 4.9,
//       reviews: 312,
//       isNew: false,
//       isGold: true,
//       metal: '18K Gold',
//       weight: '4g',
//       description: 'Exquisite gold engagement ring with a stunning diamond center. A symbol of forever love.',
//       inStock: true
//     },
//     {
//       id: 8,
//       name: 'Gold Anklet',
//       category: 'Bracelets',
//       price: 8999,
//       originalPrice: null,
//       image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=400&h=400&fit=crop&crop=center',
//       rating: 4.4,
//       reviews: 45,
//       isNew: true,
//       isGold: true,
//       metal: '22K Gold',
//       weight: '8g',
//       description: 'Traditional gold anklet with delicate design. Adds charm to your feet.',
//       inStock: true
//     },
//     {
//       id: 9,
//       name: 'Emerald Pendant',
//       category: 'Necklaces',
//       price: 12999,
//     //   originalPrice: 15999,
//       image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center',
//       rating: 4.8,
//       reviews: 92,
//       isNew: false,
//       isGold: true,
//       metal: '18K Gold',
//       weight: '5g',
//       description: 'Beautiful emerald pendant with gold setting. The perfect gift for special someone.',
//       inStock: true
//     },
//     {
//       id: 10,
//       name: 'Gold Hoop Earrings',
//       category: 'Earrings',
//       price: 6999,
//       originalPrice: null,
//       image: 'https://images.unsplash.com/photo-1617038263802-bf90c1a14335?w=400&h=400&fit=crop&crop=center',
//       rating: 4.5,
//       reviews: 134,
//       isNew: true,
//       isGold: true,
//       metal: '22K Gold',
//       weight: '3g',
//       description: 'Classic gold hoop earrings with a modern twist. Versatile and stylish.',
//       inStock: true
//     },
//     {
//       id: 11,
//       name: 'Gold Cuff Bracelet',
//       category: 'Bracelets',
//       price: 11999,
//     //   originalPrice: 14999,
//       image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&h=400&fit=crop&crop=center',
//       rating: 4.6,
//       reviews: 78,
//       isNew: false,
//       isGold: true,
//       metal: '18K Gold',
//       weight: '7g',
//       description: 'Stylish gold cuff bracelet with modern design. A statement piece for any occasion.',
//       inStock: true
//     },
//     {
//       id: 12,
//       name: 'Ruby Ring',
//       category: 'Rings',
//       price: 27999,
//       originalPrice: null,
//       image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop&crop=center',
//       rating: 4.7,
//       reviews: 156,
//       isNew: false,
//       isGold: true,
//       metal: '14K Gold',
//       weight: '3.2g',
//       description: 'Stunning ruby ring with a vibrant red stone. A statement of luxury and elegance.',
//       inStock: true
//     }
//   ];

//   // Categories for filter
//   const categories = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets'];

//   // Filter products based on selected category
//   const filteredProducts = selectedCategory === 'All' 
//     ? products 
//     : products.filter(product => product.category === selectedCategory);

//   // Sort products
//   const sortedProducts = [...filteredProducts].sort((a, b) => {
//     if (sortBy === 'price-low') return a.price - b.price;
//     if (sortBy === 'price-high') return b.price - a.price;
//     if (sortBy === 'rating') return b.rating - a.rating;
//     return 0; // popular (default)
//   });

//   // Navigate to product detail
//   const handleProductClick = (productId) => {
//     navigate(`/product/${productId}`);
//   };

//   // Add to cart handler
//   const addToCart = (e, product) => {
//     e.stopPropagation(); // Prevent navigation to product detail
    
//     // Get existing cart from localStorage
//     const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
//     // Check if product already in cart
//     const existingItem = existingCart.find(item => item.id === product.id);
    
//     if (existingItem) {
//       // Increase quantity
//       existingItem.quantity += 1;
//     } else {
//       // Add new item
//       existingCart.push({ ...product, quantity: 1 });
//     }
    
//     // Save to localStorage
//     localStorage.setItem('cart', JSON.stringify(existingCart));
    
//     // Show feedback with a toast notification
//     const toast = document.createElement('div');
//     toast.className = 'toast-notification';
//     toast.innerHTML = `✨ ${product.name} added to cart!`;
//     document.body.appendChild(toast);
//     setTimeout(() => toast.remove(), 2000);
//   };

//   // Render star rating
//   const renderStars = (rating) => {
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 >= 0.5;
//     const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
//     return (
//       <>
//         {'★'.repeat(fullStars)}
//         {hasHalfStar && '★'}
//         {'☆'.repeat(emptyStars)}
//       </>
//     );
//   };

//   return ( 
//     <div> 
//         <Navbar />
//     <div className="products-page">
//       {/* Header */}
//       <div className="products-header">
//         <h1>✨ Our Collection</h1>
//         <p>Discover exquisite jewellery pieces crafted with perfection</p>
//       </div>

//       {/* Filter and Sort Bar */}
//       <div className="filter-bar">
//         <div className="filter-section">
//           <button 
//             className="filter-toggle"
//             onClick={() => setShowFilter(!showFilter)}
//           >
//             <span>☰</span> Categories
//           </button>
          
//           <div className={`category-filters ${showFilter ? 'show' : ''}`}>
//             {categories.map(category => (
//               <button
//                 key={category}
//                 className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
//                 onClick={() => {
//                   setSelectedCategory(category);
//                   setShowFilter(false);
//                 }}
//               >
//                 {category}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="sort-section">
//           <label htmlFor="sort">Sort by:</label>
//           <select 
//             id="sort" 
//             value={sortBy}
//             onChange={(e) => setSortBy(e.target.value)}
//             className="sort-select"
//           >
//             <option value="popular">Popular</option>
//             <option value="price-low">Price: Low to High</option>
//             <option value="price-high">Price: High to Low</option>
//             <option value="rating">Highest Rated</option>
//           </select>
//         </div>
//       </div>

//       {/* Results count */}
//       <div className="results-count">
//         Showing {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
//       </div>

//       {/* Products Grid */}
//       <div className="products-grid">
//         {sortedProducts.map(product => (
//           <div 
//             key={product.id} 
//             className="product-card"
//             onClick={() => handleProductClick(product.id)}
//           >
//             {/* Product Image - Fixed empty space */}
//             <div className="product-image-wrapper">
//               <img 
//                 src={product.image} 
//                 alt={product.name}
//                 className="product-image"
//                 loading="lazy"
//                 onError={(e) => {
//                   e.target.src = 'https://via.placeholder.com/400x400/FFD700/FFFFFF?text=Jewellery';
//                 }}
//               />
//               {product.isNew && (
//                 <span className="badge-new">NEW</span>
//               )}
//               {product.originalPrice && (
//                 <span className="badge-discount">
//                   {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
//                 </span>
//               )}
//             </div>

//             {/* Product Details */}
//             <div className="product-details">
//               <div className="product-meta">
//                 <span className="product-category">{product.category}</span>
//                 <span className="product-metal">{product.metal}</span>
//               </div>
              
//               <h3 className="product-name">{product.name}</h3>
              
//               <div className="product-rating">
//                 <span className="stars">{renderStars(product.rating)}</span>
//                 <span className="rating-text">{product.rating}</span>
//                 <span className="reviews">({product.reviews} reviews)</span>
//               </div>
              
//               <div className="product-weight">
//                 ⚖️ Weight: {product.weight}
//               </div>
              
//               <div className="product-price">
//                 <span className="current-price">₹{product.price.toLocaleString()}</span>
//                 {product.originalPrice && (
//                   <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
//                 )}
//               </div>
              
//               <button 
//                 className="add-to-cart-btn"
//                 onClick={(e) => addToCart(e, product)}
//               >
//                 <span>🛒</span> Add to Cart
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Empty State */}
//       {sortedProducts.length === 0 && (
//         <div className="empty-state">
//           <p>No products found in this category</p>
//         </div>
//       )}
//     </div>  
//     <Footer/>
//     </div>
//   );
// };

// export default Products; 





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

  // Fetch cart items from API
  const fetchCartItems = async () => {
    try {
      const customerId = getCustomerId();
      
      if (!customerId) {
        console.warn('No customer ID found, cannot fetch cart');
        return {};
      }

      const response = await fetch(`${baseURL}/api/cart/?customer_id=${customerId}`, {
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

      // Create a map of product IDs that are in the cart
      const cartMap = {};
      if (data && data.items && data.items.length > 0) {
        data.items.forEach(item => {
          const productId = item.product_details?.opentag_id;
          if (productId) {
            cartMap[productId] = true;
          }
        });
        
        // Also update localStorage with the cart data
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
      
      // Fallback to localStorage
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
        
        // Fetch products
        const productsResponse = await fetch(`${baseURL}/api/opening-tags/`);
        
        if (!productsResponse.ok) {
          throw new Error(`HTTP error! status: ${productsResponse.status}`);
        }
        
        const productsData = await productsResponse.json();
        
        if (productsData.status && productsData.data) {
          // Transform API data to match your product structure
          const transformedProducts = productsData.data.map((item, index) => ({
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
            productData: item
          }));
          
          setProducts(transformedProducts);
          
          // Fetch cart items and mark which products are in cart
          const cartMap = await fetchCartItems();
          setAddedToCart(cartMap);
          
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setProducts(getFallbackProducts());
        
        // Still try to fetch cart for fallback products
        const cartMap = await fetchCartItems();
        setAddedToCart(cartMap);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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
        inStock: true
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
        inStock: true
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
        inStock: true
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
        inStock: true
      }
    ];
  };

  // Show SweetAlert success popup
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
        navigate('/cart');
      }
    });
  };

  // Show error popup
  const showErrorPopup = (errorMessage) => {
    Swal.fire({
      title: '❌ Error!',
      text: errorMessage || 'Failed to add item to cart. Please try again.',
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
      const customerId = getCustomerId();
      const unitPrice = product.productData?.total_price || product.price.toString();
      
      const cartData = {
        customer: customerId,
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
        // Update addedToCart state
        setAddedToCart(prev => ({ ...prev, [product.id]: true }));
        
        // Update localStorage
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
      
      // Fallback: Add to localStorage
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
  if (loading) {
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
                    <span className="product-category">{product.category}</span>
                    <span className="product-metal">{product.metal}</span>
                  </div>
                  
                  <h3 className="product-name">{product.name || product.subCategory}</h3>
                  
                  {product.purity && (
                    <div className="product-purity">
                      💎 Purity: {product.purity}%
                    </div>
                  )}
                  
                  <div className="product-rating">
                    <span className="stars">{renderStars(product.rating)}</span>
                    <span className="rating-text">{product.rating.toFixed(1)}</span>
                    <span className="reviews">({product.reviews} reviews)</span>
                  </div>
                  
                  <div className="product-weight">
                    ⚖️ Weight: {product.weight}
                  </div>
                  
                  <div className="product-price">
                    <span className="current-price">₹{product.price.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                    {product.originalPrice && (
                      <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                  
                  <button 
                    className={`add-to-cart-btn ${isAdded ? 'added' : ''} ${addingToCart[product.id] ? 'loading' : ''}`}
                    onClick={(e) => addToCart(e, product)}
                    disabled={!product.inStock || addingToCart[product.id] || isAdded}
                  >
                    {addingToCart[product.id] ? (
                      <span>⏳ Adding...</span>
                    ) : isAdded ? (
                      <span>✓ Added to Cart</span>
                    ) : (
                      <span>🛒 {product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                    )}
                  </button>
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

      {/* Add SweetAlert styles */}
      <style jsx>{`
        .swal-popup-custom {
          border-radius: 15px;
          box-shadow: 0 0 20px rgba(201, 168, 76, 0.3);
        }
        .swal-confirm-btn {
          background-color: #C9A84C !important;
          color: #000 !important;
          font-weight: 600 !important;
          padding: 10px 25px !important;
          border-radius: 8px !important;
        }
        .swal-cancel-btn {
          background-color: #d33 !important;
          color: #fff !important;
          font-weight: 600 !important;
          padding: 10px 25px !important;
          border-radius: 8px !important;
        }
        .badge-added {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #4CAF50;
          color: white;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          z-index: 5;
          box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
          animation: fadeInScale 0.3s ease-out;
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .add-to-cart-btn.added {
          background: linear-gradient(135deg, #4CAF50, #45a049) !important;
          color: white !important;
          cursor: default !important;
        }
        .add-to-cart-btn.added:hover {
          transform: none !important;
          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4) !important;
        }
        .add-to-cart-btn.loading {
          opacity: 0.7;
          cursor: wait !important;
        }
      `}</style>
    </div>
  );
};

export default Products;