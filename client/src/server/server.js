// API base URL - uses environment variable for production
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3003/api';

const useProductService = () => {
	const _apiBase = `${API_BASE}/products`

	// GET ALL PRODUCTS
	const getAllProducts = async () => {
		try {
			// Add timestamp to prevent browser caching
			const response = await fetch(`${_apiBase}?_t=${Date.now()}`)
			const products = await response.json()

			if (!products.success) return []

			return products.data.map(product => _transformProduct(product))
		} catch (error) {
			console.error('Mahsulotlarni olishda xatolik:', error)
			return []
		}
	}

	// GET ONE PRODUCT
	const getDetailedProduct = async id => {
		try {
			const response = await fetch(`${_apiBase}/${id}`)
			const product = await response.json()

			if (!product.success) return null

			return _transformProduct(product.data)
		} catch (error) {
			console.error('Mahsulotni olishda xatolik:', error)
			return null
		}
	}

	// GET RELATED PRODUCTS
	const getRelatedProduct = async id => {
		try {
			const response = await fetch(`${_apiBase}/${id}/related`)
			const products = await response.json()

			if (!products.success) return []

			return products.data.map(product => _transformProduct(product))
		} catch (error) {
			console.error('Related mahsulotlarni olishda xatolik:', error)
			return []
		}
	}

	// POST PRODUCT
	const postProduct = async (productObject, token) => {
		try {
			const response = await fetch(_apiBase, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(productObject),
			})

			const product = await response.json()

			if (!product.success) return null

			return _transformProduct(product.data)
		} catch (error) {
			console.error('POST product error:', error)
			return null
		}
	}

	// PUT PRODUCT (UPDATE)
	const putProduct = async (id, updatedData, token) => {
		try {
			const response = await fetch(`${_apiBase}/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(updatedData),
			})

			const result = await response.json()

			if (!result.success) {
				console.error('PUT failed:', result.message)
				return null
			}

			return _transformProduct(result.data)
		} catch (error) {
			console.error('PUT product error:', error)
			return null
		}
	}

	// DELETE PRODUCT
	const deleteProduct = async (id, token) => {
		try {
			const response = await fetch(`${_apiBase}/${id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
			})

			const product = await response.json()

			if (!product.success) {
				console.error('Delete failed:', product.message)
				return false
			}

			return true
		} catch (error) {
			console.error('Delete error:', error)
			return false
		}
	}

	// CREATE ORDER
	const createOrder = async (orderData) => {
		try {
			const response = await fetch(`${API_BASE}/orders`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(orderData)
			});
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Create order error:', error);
			return { success: false, message: error.message };
		}
	};

	// GET USER ORDERS (BY PHONE)
	const getUserOrders = async (phone) => {
		try {
			const response = await fetch(`${API_BASE}/orders/user/${phone}`);
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Get user orders error:', error);
			return { success: false, message: error.message };
		}
	};

	// REGISTER USER
	const registerUser = async (userData) => {
		try {
			const response = await fetch(`${API_BASE}/auth/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(userData)
			});
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Register error:', error);
			return { success: false, message: error.message };
		}
	};

	// LOGIN USER
	const loginUser = async (credentials) => {
		try {
			const response = await fetch(`${API_BASE}/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(credentials)
			});
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Login error:', error);
			return { success: false, message: error.message };
		}
	};

	// GET USER PROFILE (AUTH)
	const getUserProfile = async (token) => {
		try {
			const response = await fetch(`${API_BASE}/auth/profile`, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Get profile error:', error);
			return { success: false, message: error.message };
		}
	};

	// GET MY ORDERS (AUTH)
	const getMyOrders = async (token) => {
		try {
			const response = await fetch(`${API_BASE}/orders/my-orders`, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Get my orders error:', error);
			return { success: false, message: error.message };
		}
	};

	// TRANSFORM FUNCTION
	const _transformProduct = product => {
		let firstImage = '';
		if (product.images && product.images.length > 0) {
			const first = product.images[0];
			firstImage = typeof first === 'object' ? first.url : first;
		} else if (product.image) {
			firstImage = product.image;
		}

		return {
			id: product._id,
			name: product.name,
			price: product.price,
			originalPrice: product.originalPrice,
			category: product.category,
			images: product.images,
			image: firstImage,
			badge: product.badge,
			rating: product.rating,
			colors: product.colors,
			sizes: product.sizes,
			description: product.description,
			createdAt: product.createdAt,
		}
	}

	// GET ALL ORDERS (ADMIN)
	const getAllOrders = async (token) => {
		try {
			const response = await fetch(`${API_BASE}/orders/all`, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Get all orders error:', error);
			return { success: false, message: error.message };
		}
	};

	// GET ALL USER POINTS (ADMIN)
	const getAllUserPoints = async (token) => {
		try {
			const response = await fetch(`${API_BASE}/points/admin/all`, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Get all points error:', error);
			return { success: false, message: error.message };
		}
	};

	// ADMIN ADJUST POINTS
	const adminAdjustPoints = async (adjustmentData, token) => {
		try {
			const response = await fetch(`${API_BASE}/points/admin/adjust`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(adjustmentData)
			});
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Adjust points error:', error);
			return { success: false, message: error.message };
		}
	};

	// SET CHALLENGE WINNER (ADMIN)
	const setChallengeWinner = async (challengeId, userId, token) => {
		try {
			const response = await fetch(`${API_BASE}/challenges/${challengeId}/winner`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ userId })
			});
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Set challenge winner error:', error);
			return { success: false, message: error.message };
		}
	};


	// DELETE ORDER (ADMIN)
	const deleteOrder = async (orderId, token) => {
		try {
			const url = `${API_BASE}/orders/${orderId}`;
			console.log('🔗 DELETE URL:', url);
			console.log('🔑 Order ID:', orderId);

			const response = await fetch(url, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			console.log('📡 Response status:', response.status);

			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Delete order error:', error);
			return { success: false, message: error.message };
		}
	};


	// UPDATE ORDER STATUS (ADMIN)
	const updateOrderStatus = async (orderId, status, token) => {
		try {
			const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ status })
			});
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Update order status error:', error);
			return { success: false, message: error.message };
		}
	};

	// UPDATE USER CART
	const updateUserCart = async (cart, token) => {
		try {
			const response = await fetch(`${API_BASE}/auth/cart`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ cart })
			});
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Update cart error:', error);
			return { success: false, message: error.message };
		}
	};

	// GET ALL USERS (ADMIN)
	const getAllUsers = async (token) => {
		try {
			const response = await fetch(`${API_BASE}/auth/users`, {
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Get all users error:', error);
			return { success: false, message: error.message };
		}
	};

	// GET IMAGEKIT AUTH
	const getImageKitAuth = async () => {
		try {
			const response = await fetch(`${API_BASE}/imagekit-auth`);
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('ImageKit auth error:', error);
			return null;
		}
	};

	// LOOKBOOK API
	const getAllLooks = async () => {
		try {
			const response = await fetch(`${API_BASE}/looks`);
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Get looks error:', error);
			return { success: false, message: error.message };
		}
	};

	const createLook = async (lookData, token) => {
		try {
			const response = await fetch(`${API_BASE}/looks`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(lookData)
			});
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Create look error:', error);
			return { success: false, message: error.message };
		}
	};

	const deleteLook = async (id, token) => {
		try {
			const response = await fetch(`${API_BASE}/looks/${id}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Delete look error:', error);
			return { success: false, message: error.message };
		}
	};

	const getLookById = async (id) => {
		try {
			const response = await fetch(`${API_BASE}/looks/${id}`);
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Get look by ID error:', error);
			return { success: false, message: error.message };
		}
	};

	const updateLook = async (id, lookData, token) => {
		try {
			const response = await fetch(`${API_BASE}/looks/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(lookData)
			});
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Update look error:', error);
			return { success: false, message: error.message };
		}
	};

	const toggleLookActive = async (id, token) => {
		try {
			const response = await fetch(`${API_BASE}/looks/${id}/toggle`, {
				method: 'PATCH',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Toggle look active error:', error);
			return { success: false, message: error.message };
		}
	};

	const getLookPrice = async (id) => {
		try {
			const response = await fetch(`${API_BASE}/looks/${id}/price`);
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Get look price error:', error);
			return { success: false, message: error.message };
		}
	};

	const getLookStock = async (id) => {
		try {
			const response = await fetch(`${API_BASE}/looks/${id}/stock`);
			const result = await response.json();
			return result;
		} catch (error) {
			console.error('Get look stock error:', error);
			return { success: false, message: error.message };
		}
	};

	// PROMO CODES API
	const validatePromo = async (code) => {
		try {
			const response = await fetch(`${API_BASE}/promos/validate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code })
			});
			return await response.json();
		} catch (error) {
			console.error('Validate promo error:', error);
			return { success: false, message: error.message };
		}
	};

	const validateGiftCard = async (code) => {
		try {
			const response = await fetch(`${API_BASE}/gift-cards/validate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code })
			});
			return await response.json();
		} catch (error) {
			console.error('Validate gift card error:', error);
			return { success: false, message: error.message };
		}
	};

	const getMyGiftCards = async (token) => {
		try {
			const response = await fetch(`${API_BASE}/gift-cards/my`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			return await response.json();
		} catch (error) {
			console.error('Get my gift cards error:', error);
			return { success: false, message: error.message };
		}
	};

	const transferGiftCard = async (id, recipientPhone, token) => {
		try {
			const response = await fetch(`${API_BASE}/gift-cards/${id}/transfer`, {
				method: 'PUT',
				headers: { 
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ recipientPhone })
			});
			return await response.json();
		} catch (error) {
			console.error('Transfer gift card error:', error);
			return { success: false, message: error.message };
		}
	};

	const validateCoupon = async (code, totalAmount, token) => {
		try {
			const response = await fetch(`${API_BASE}/coupons/validate`, {
				method: 'POST',
				headers: { 
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ code, totalAmount })
			});
			return await response.json();
		} catch (error) {
			console.error('Validate coupon error:', error);
			return { success: false, message: error.message };
		}
	};

	const getPromos = async (token) => {
		try {
			const response = await fetch(`${API_BASE}/promos`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			return await response.json();
		} catch (error) {
			console.error('Get promos error:', error);
			return { success: false, message: error.message };
		}
	};

	const createPromo = async (promoData, token) => {
		try {
			const response = await fetch(`${API_BASE}/promos`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(promoData)
			});
			return await response.json();
		} catch (error) {
			console.error('Create promo error:', error);
			return { success: false, message: error.message };
		}
	};

	const updatePromoStatus = async (id, isActive, token) => {
		try {
			const response = await fetch(`${API_BASE}/promos/${id}/status`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ isActive })
			});
			return await response.json();
		} catch (error) {
			console.error('Update promo status error:', error);
			return { success: false, message: error.message };
		}
	};

	const deletePromo = async (id, token) => {
		try {
			const response = await fetch(`${API_BASE}/promos/${id}`, {
				method: 'DELETE',
				headers: { 'Authorization': `Bearer ${token}` }
			});
			return await response.json();
		} catch (error) {
			console.error('Delete promo error:', error);
			return { success: false, message: error.message };
		}
	};

	// BUNDLE API
	const getAllBundles = async () => {
		try {
			const response = await fetch(`${API_BASE}/bundles`);
			return await response.json();
		} catch (error) {
			console.error('Get bundles error:', error);
			return { success: false, data: [] };
		}
	};

	const createBundle = async (bundleData, token) => {
		try {
			const response = await fetch(`${API_BASE}/bundles`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(bundleData)
			});
			return await response.json();
		} catch (error) {
			console.error('Create bundle error:', error);
			return { success: false, message: error.message };
		}
	};

	const updateBundle = async (id, bundleData, token) => {
		try {
			const response = await fetch(`${API_BASE}/bundles/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify(bundleData)
			});
			return await response.json();
		} catch (error) {
			console.error('Update bundle error:', error);
			return { success: false, message: error.message };
		}
	};

	const deleteBundle = async (id, token) => {
		try {
			const response = await fetch(`${API_BASE}/bundles/${id}`, {
				method: 'DELETE',
				headers: { 'Authorization': `Bearer ${token}` }
			});
			return await response.json();
		} catch (error) {
			console.error('Delete bundle error:', error);
			return { success: false, message: error.message };
		}
	};

	return {
		getAllProducts,
		getDetailedProduct,
		getRelatedProduct,
		postProduct,
		deleteProduct,
		putProduct,
		createOrder,
		getUserOrders,
		registerUser,
		loginUser,
		getUserProfile,
		getMyOrders,
		getAllOrders,
		updateOrderStatus,
		deleteOrder,
		getAllUsers,
		updateUserCart,
		getImageKitAuth,
		getAllLooks,
		getLookById,
		createLook,
		updateLook,
		deleteLook,
		toggleLookActive,
		getLookPrice,
		getLookStock,
		validatePromo,
		validateGiftCard,
		getMyGiftCards,
		transferGiftCard,
		validateCoupon,
		getPromos,
		createPromo,
		updatePromoStatus,
		deletePromo,
		getAllUserPoints,
		adminAdjustPoints,
		setChallengeWinner,
		getAllBundles,
		createBundle,
		updateBundle,
		deleteBundle
	}
}

export default useProductService
