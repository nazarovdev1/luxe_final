import Announcement from '../models/announcement.model.js';

export const createAnnouncement = async (req, res) => {
    try {
        const { content, type, expiryDate } = req.body;

        // Automatically deactivate others for a cleaner single-banner approach.
        await Announcement.updateMany({ isActive: true }, { isActive: false });

        const newAnnouncement = new Announcement({
            content,
            type: type || 'info',
            isActive: true,
            expiryDate
        });

        await newAnnouncement.save();
        res.status(201).json(newAnnouncement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getActiveAnnouncement = async (req, res) => {
    try {
        // Find the most recent active announcement
        const announcement = await Announcement.findOne({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json(announcement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleStatus = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

        // If we are enabling this one, disable others
        if (!announcement.isActive) {
            await Announcement.updateMany({ _id: { $ne: announcement._id } }, { isActive: false });
        }

        announcement.isActive = !announcement.isActive;
        await announcement.save();
        res.status(200).json(announcement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
