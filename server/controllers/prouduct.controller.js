import mongoose from 'mongoose'
import Product from '../models/product.model.js'

// Simple in-memory cache for products
let productsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache for better performance

// Clear cache helper
const clearProductsCache = () => {
	productsCache = null;
	cacheTimestamp = 0;
};

export const getProduct = async (req, res) => {
	try {
		const now = Date.now();

		// Check if cache is valid
		if (productsCache && (now - cacheTimestamp) < CACHE_DURATION) {
			// Set cache headers for browser caching
			res.set('Cache-Control', 'public, max-age=60');
			return res.status(200).json({ success: true, data: productsCache });
		}

		// Fetch from database with lean() for better performance
		// OPTIMIZATION: Only fetch the first image for the list view to reduce load time
		// Images are stored as Base64, so fetching all of them at once is too heavy.
		const products = await Product.find({})
			.select({
				name: 1,
				price: 1,
				originalPrice: 1,
				category: 1,
				badge: 1,
				rating: 1,
				colors: 1,
				sizes: 1,
				description: 1,
				createdAt: 1,
				images: { $slice: 1 } // Only get the first image
			})
			.lean();

		// Update cache
		productsCache = products;
		cacheTimestamp = now;

		// Set cache headers
		res.set('Cache-Control', 'public, max-age=60');
		res.status(200).json({ success: true, data: products });
	} catch (error) {
		console.error('error in fetching products:', error.message)
		res.status(500).json({ success: false, message: 'Server Error' })
	}
}

export const getSingleProduct = async (req, res) => {
	const { id } = req.params

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res
			.status(400)
			.json({ success: false, message: 'Invalid Product ID' })
	}

	try {
		// Use lean() for better performance
		const product = await Product.findById(id).lean()

		if (!product) {
			return res.status(404).json({
				success: false,
				message: 'Product not found',
			})
		}

		res.set('Cache-Control', 'public, max-age=300'); // 5 minutes for single product
		res.status(200).json({ success: true, data: product })
	} catch (error) {
		console.error('Error fetching single product:', error.message)
		res.status(500).json({ success: false, message: 'Server Error' })
	}
}

export const getRelatedProducts = async (req, res) => {
	const { id } = req.params

	try {
		// Asosiy mahsulotni topamiz
		const product = await Product.findById(id).lean()

		if (!product) {
			return res.status(404).json({
				success: false,
				message: 'Mahsulot topilmadi',
			})
		}

		// Shu product bilan bir xil category bo'lgan boshqa mahsulotlarni olish
		const relatedProducts = await Product.find({
			category: product.category,
			_id: { $ne: id }, // asosiy product chiqmaydi
		})
			.select({
				name: 1,
				price: 1,
				originalPrice: 1,
				category: 1,
				badge: 1,
				rating: 1,
				images: { $slice: 1 }
			})
			.limit(10)
			.lean()

		res.set('Cache-Control', 'public, max-age=300');
		res.status(200).json({
			success: true,
			data: relatedProducts,
		})
	} catch (error) {
		console.error('Related product xatosi:', error)
		res.status(500).json({
			success: false,
			message: 'Server xatosi',
		})
	}
}

export const postProduct = async (req, res) => {
	const product = req.body;
	console.log('Received product data:', JSON.stringify(product, null, 2));

	if (!product.name || !product.price || !product.category || !product.images || product.images.length === 0) {
		return res.status(400).json({
			success: false,
			message: "Majburiy maydonlar to'liq emas",
		});
	}

	try {
		const newProduct = new Product(product);
		await newProduct.save();

		// Clear cache when new product is added
		clearProductsCache();

		res.status(201).json({ success: true, data: newProduct });
	} catch (error) {
		console.error('Error creating product:', error);
		res.status(500).json({ success: false, message: "Server xatosi: " + error.message });
	}
};

export const putProduct = async (req, res) => {
	const { id } = req.params;

	try {
		const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });

		// Clear cache when product is updated
		clearProductsCache();

		res.status(200).json({ success: true, data: updated });
	} catch (err) {
		res.status(500).json({ success: false, message: "Yangilashda xato" });
	}
};


export const deleteProduct = async (req, res) => {
	const { id } = req.params

	try {
		await Product.findByIdAndDelete(id)

		// Clear cache when product is deleted
		clearProductsCache();

		res.status(200).json({ success: true, message: 'Product deleted' })
	} catch (error) {
		console.error('error in fetching products:', error.message)
		res.status(404).json({ success: false, message: 'Product not found' })
	}
}
