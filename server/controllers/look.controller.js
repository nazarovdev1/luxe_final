import Look from '../models/look.model.js';

// Get all looks
export const getAllLooks = async (req, res) => {
    try {
        const looks = await Look.find().sort({ createdAt: -1 }).populate('products');
        res.status(200).json({
            success: true,
            data: looks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Create new look
export const createLook = async (req, res) => {
    try {
        const look = await Look.create(req.body);
        res.status(201).json({
            success: true,
            data: look
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Invalid data',
            error: error.message
        });
    }
};

// Delete look
export const deleteLook = async (req, res) => {
    try {
        const look = await Look.findByIdAndDelete(req.params.id);
        if (!look) {
            return res.status(404).json({
                success: false,
                message: 'Look not found'
            });
        }
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

export default {
    getAllLooks,
    createLook,
    deleteLook
};
