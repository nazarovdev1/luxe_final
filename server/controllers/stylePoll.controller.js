import mongoose from 'mongoose'
import StylePoll from '../models/stylePoll.model.js'
import logger from '../utils/logger.js'

const isStaff = (user) => user && (user.role === 'admin' || user.role === 'manager' || user.isAdmin)

const sanitizeOptions = (options = []) => options
  .map((option) => ({
    _id: mongoose.Types.ObjectId.isValid(option._id) ? option._id : undefined,
    label: String(option.label || '').trim(),
    image: String(option.image || '').trim(),
    product: mongoose.Types.ObjectId.isValid(option.product) ? option.product : null
  }))
  .filter((option) => option.label && option.image)

const serializePoll = (poll) => {
  const plain = typeof poll.toObject === 'function' ? poll.toObject({ virtuals: true }) : poll
  const totalVotes = plain.options?.reduce((sum, option) => sum + (option.votes || 0), 0) || 0
  return {
    ...plain,
    totalVotes
  }
}

const getTimeLeft = (expiresAt) => {
  if (!expiresAt) return null

  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Tugagan'

  const hours = Math.ceil(diff / (1000 * 60 * 60))
  if (hours < 24) return `${hours} soat`

  const days = Math.ceil(hours / 24)
  return `${days} kun`
}

const publicPollProjection = {
  question: 1,
  category: 1,
  options: 1,
  isActive: 1,
  expiresAt: 1,
  createdAt: 1
}

export const getActiveStylePolls = async (req, res) => {
  try {
    const now = new Date()
    const polls = await StylePoll.find({
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } }
      ]
    }, publicPollProjection)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean({ virtuals: true })

    res.json({
      success: true,
      data: polls.map((poll) => ({
        ...serializePoll(poll),
        timeLeft: getTimeLeft(poll.expiresAt)
      }))
    })
  } catch (error) {
    logger.error('Get style polls error:', error)
    res.status(500).json({ success: false, message: 'So\'rovnomalarni yuklashda xato' })
  }
}

export const getAdminStylePolls = async (req, res) => {
  try {
    if (!isStaff(req.user)) {
      return res.status(403).json({ success: false, message: 'Ruxsat yo\'q' })
    }

    const polls = await StylePoll.find()
      .populate('createdBy', 'username phone')
      .populate('options.product', 'name price images')
      .populate('votes.user', 'username phone')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      data: polls.map((poll) => ({
        ...serializePoll(poll),
        timeLeft: getTimeLeft(poll.expiresAt)
      }))
    })
  } catch (error) {
    logger.error('Get admin style polls error:', error)
    res.status(500).json({ success: false, message: 'Admin so\'rovnomalarni yuklashda xato' })
  }
}

export const createStylePoll = async (req, res) => {
  try {
    if (!isStaff(req.user)) {
      return res.status(403).json({ success: false, message: 'Ruxsat yo\'q' })
    }

    const options = sanitizeOptions(req.body.options)
    if (options.length < 2) {
      return res.status(400).json({ success: false, message: 'Kamida 2 ta rasmli variant tanlang' })
    }

    const poll = await StylePoll.create({
      question: String(req.body.question || '').trim(),
      category: String(req.body.category || 'Community').trim(),
      options,
      isActive: req.body.isActive !== false,
      expiresAt: req.body.expiresAt || null,
      createdBy: req.user._id
    })

    res.status(201).json({ success: true, data: serializePoll(poll) })
  } catch (error) {
    logger.error('Create style poll error:', error)
    res.status(400).json({ success: false, message: error.message })
  }
}

export const updateStylePoll = async (req, res) => {
  try {
    if (!isStaff(req.user)) {
      return res.status(403).json({ success: false, message: 'Ruxsat yo\'q' })
    }

    const poll = await StylePoll.findById(req.params.id)
    if (!poll) {
      return res.status(404).json({ success: false, message: 'So\'rovnoma topilmadi' })
    }

    const options = sanitizeOptions(req.body.options)
    if (options.length < 2) {
      return res.status(400).json({ success: false, message: 'Kamida 2 ta rasmli variant tanlang' })
    }

    poll.question = String(req.body.question || poll.question).trim()
    poll.category = String(req.body.category || poll.category || 'Community').trim()
    poll.expiresAt = req.body.expiresAt || null
    poll.isActive = req.body.isActive !== false

    const existingVotes = new Map(poll.options.map((option) => [String(option._id), option.votes || 0]))
    poll.options = options.map((option) => ({
      ...option,
      votes: option._id && existingVotes.has(String(option._id)) ? existingVotes.get(String(option._id)) : 0
    }))

    if (poll.votes.length > 0) {
      const validOptionIds = new Set(poll.options.map((option) => String(option._id)))
      poll.votes = poll.votes.filter((vote) => validOptionIds.has(String(vote.option)))
    }

    await poll.save()
    res.json({ success: true, data: serializePoll(poll) })
  } catch (error) {
    logger.error('Update style poll error:', error)
    res.status(400).json({ success: false, message: error.message })
  }
}

export const deleteStylePoll = async (req, res) => {
  try {
    if (!isStaff(req.user)) {
      return res.status(403).json({ success: false, message: 'Ruxsat yo\'q' })
    }

    const poll = await StylePoll.findByIdAndDelete(req.params.id)
    if (!poll) {
      return res.status(404).json({ success: false, message: 'So\'rovnoma topilmadi' })
    }

    res.json({ success: true, message: 'So\'rovnoma o\'chirildi' })
  } catch (error) {
    logger.error('Delete style poll error:', error)
    res.status(500).json({ success: false, message: 'So\'rovnomani o\'chirishda xato' })
  }
}

export const voteStylePoll = async (req, res) => {
  try {
    const { optionId, voterKey } = req.body
    const normalizedVoterKey = String(voterKey || '').trim()

    if (!mongoose.Types.ObjectId.isValid(req.params.id) || !mongoose.Types.ObjectId.isValid(optionId)) {
      return res.status(400).json({ success: false, message: 'Noto\'g\'ri so\'rovnoma yoki variant' })
    }

    if (!normalizedVoterKey) {
      return res.status(400).json({ success: false, message: 'Ovoz beruvchi identifikatori kerak' })
    }

    const now = new Date()
    const poll = await StylePoll.findOneAndUpdate(
      {
        _id: req.params.id,
        isActive: true,
        'options._id': optionId,
        votes: { $not: { $elemMatch: { voterKey: normalizedVoterKey } } },
        $or: [
          { expiresAt: null },
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: now } }
        ]
      },
      {
        $inc: { 'options.$[selected].votes': 1 },
        $push: {
          votes: {
            option: optionId,
            voterKey: normalizedVoterKey,
            ip: req.ip || '',
            userAgent: req.headers['user-agent'] || ''
          }
        }
      },
      {
        new: true,
        arrayFilters: [{ 'selected._id': new mongoose.Types.ObjectId(optionId) }]
      }
    )

    if (!poll) {
      return res.status(409).json({ success: false, message: 'So\'rovnoma topilmadi, tugagan yoki siz allaqachon ovoz bergansiz' })
    }

    res.json({
      success: true,
      data: serializePoll(poll),
      votedOption: optionId
    })
  } catch (error) {
    logger.error('Vote style poll error:', error)
    res.status(500).json({ success: false, message: 'Ovoz berishda xato' })
  }
}
