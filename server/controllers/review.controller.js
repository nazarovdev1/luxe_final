import Review from '../models/review.model.js'
import Product from '../models/product.model.js'

export const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'username')
            .sort({ createdAt: -1 })
        res.json(reviews)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body
        const userId = req.user._id

        const review = new Review({
            product: productId,
            user: userId,
            rating,
            comment,
        })

        await review.save()

        // Update product rating
        const reviews = await Review.find({ product: productId })
        const avgRating =
            reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length

        await Product.findByIdAndUpdate(productId, { rating: avgRating })

        res.status(201).json(review)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)

        if (!review) {
            return res.status(404).json({ message: 'Sharh topilmadi' })
        }

        await Review.deleteOne({ _id: req.params.id })

        // Recalculate product rating
        const reviews = await Review.find({ product: review.product })
        let avgRating = 0
        if (reviews.length > 0) {
            avgRating =
                reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
        }

        await Product.findByIdAndUpdate(review.product, { rating: avgRating })

        res.json({ message: 'Sharh o\'chirildi' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
