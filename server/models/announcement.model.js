import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Announcement content is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'sale', 'new_arrival'],
        default: 'info'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiryDate: {
        type: Date
    }
}, { timestamps: true });

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
