import Review from '../models/review.model.js'
import Product from '../models/product.model.js'
import pointsService from '../services/points.service.js'

// Rating and review count always come from stored reviews, never from admin input.
export const recalculateProductRating = async (productId) => {
    const reviews = await Review.find({ product: productId }).select('rating').lean()
    const numOfReviews = reviews.length
    const rating = numOfReviews
        ? Math.round((reviews.reduce((acc, item) => acc + item.rating, 0) / numOfReviews) * 10) / 10
        : 0
    await Product.findByIdAndUpdate(productId, { rating, numOfReviews })
    return { rating, numOfReviews }
}

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

        // Award points for writing a review
        try {
            await pointsService.addPoints(userId, 50, {
                source: 'review',
                description: 'Mahsulotga sharh yozildi',
                referenceId: review._id,
                referenceModel: 'Review'
            })
        } catch (error) {
            console.error('Points error for review:', error)
        }

        await recalculateProductRating(productId)

        res.status(201).json(review)
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Siz bu mahsulotga allaqachon sharh qoldirgansiz' })
        }
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

        await recalculateProductRating(review.product)

        res.json({ message: 'Sharh o\'chirildi' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
