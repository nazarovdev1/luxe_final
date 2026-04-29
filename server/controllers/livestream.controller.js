import Livestream from '../models/livestream.model.js'

// @desc    Get all livestreams
// @route   GET /api/livestreams
// @access  Public
export const getLivestreams = async (req, res) => {
  try {
    const streams = await Livestream.find()
      .populate('featuredProducts', 'name price images')
      .populate('host', 'username profileImage')
      .sort({ scheduledStartTime: 1 })
    res.json({ success: true, data: streams })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get single livestream
// @route   GET /api/livestreams/:id
// @access  Public
export const getLivestreamById = async (req, res) => {
  try {
    const stream = await Livestream.findById(req.params.id)
      .populate('featuredProducts', 'name price images')
      .populate('host', 'username profileImage')
    
    if (!stream) {
      return res.status(404).json({ success: false, message: 'Livestream topilmadi' })
    }

    res.json({ success: true, data: stream })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Create a livestream
// @route   POST /api/livestreams
// @access  Admin
export const createLivestream = async (req, res) => {
  try {
    const { title, description, videoUrl, scheduledStartTime, featuredProducts } = req.body

    const stream = new Livestream({
      title,
      description,
      videoUrl,
      scheduledStartTime,
      featuredProducts,
      host: req.user._id
    })

    const createdStream = await stream.save()
    res.status(201).json({ success: true, data: createdStream })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

// @desc    Update livestream status
// @route   PUT /api/livestreams/:id/status
// @access  Admin
export const updateLivestreamStatus = async (req, res) => {
  try {
    const { status } = req.body
    const stream = await Livestream.findById(req.params.id)

    if (!stream) {
      return res.status(404).json({ success: false, message: 'Livestream topilmadi' })
    }

    stream.status = status

    if (status === 'live') {
      stream.actualStartTime = new Date()
    } else if (status === 'ended') {
      stream.endTime = new Date()
    }

    await stream.save()
    res.json({ success: true, data: stream })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

// @desc    Delete a livestream
// @route   DELETE /api/livestreams/:id
// @access  Admin
export const deleteLivestream = async (req, res) => {
  try {
    console.log('Deleting livestream with ID:', req.params.id);
    const stream = await Livestream.findById(req.params.id)

    if (!stream) {
      console.log('Livestream not found:', req.params.id);
      return res.status(404).json({ success: false, message: 'Livestream topilmadi' })
    }

    await Livestream.findByIdAndDelete(req.params.id)
    console.log('Livestream deleted successfully');
    res.json({ success: true, message: 'Efir o\'chirildi' })
  } catch (error) {
    console.error('Delete Livestream Error:', error);
    res.status(500).json({ success: false, message: error.message })
  }
}
