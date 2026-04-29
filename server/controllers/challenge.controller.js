import Challenge from '../models/challenge.model.js'
import pointsService from '../services/points.service.js'
import logger from '../utils/logger.js'

// @desc    Get all challenges
// @route   GET /api/challenges
// @access  Public/Private
export const getAllChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({})
      .populate('submissions.user', 'username profileImage')
      .populate('submissions.post', 'images caption')
    res.json({ success: true, data: challenges })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get active challenges
// @route   GET /api/challenges/active
// @access  Public/Private
export const getActiveChallenges = async (req, res) => {
  try {
    const now = new Date()
    const challenges = await Challenge.find({
      isActive: true,
      startDate: { $lte: now },
      $or: [{ endDate: { $gte: now } }, { endDate: null }]
    }).populate('submissions.user', 'username profileImage')
      .populate('submissions.post', 'images caption')
    res.json({ success: true, data: challenges })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Create a challenge
// @route   POST /api/challenges
// @access  Admin
export const createChallenge = async (req, res) => {
  try {
    const challenge = new Challenge(req.body)
    const createdChallenge = await challenge.save()
    res.status(201).json({ success: true, data: createdChallenge })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

// @desc    Update a challenge
// @route   PUT /api/challenges/:id
// @access  Admin
export const updateChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)

    if (challenge) {
      Object.assign(challenge, req.body)
      const updatedChallenge = await challenge.save()
      res.json({ success: true, data: updatedChallenge })
    } else {
      res.status(404).json({ success: false, message: 'Challenge not found' })
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

// @desc    Delete a challenge
// @route   DELETE /api/challenges/:id
// @access  Admin
export const deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)

    if (challenge) {
      await challenge.deleteOne()
      res.json({ success: true, message: 'Challenge removed' })
    } else {
      res.status(404).json({ success: false, message: 'Challenge not found' })
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

// @desc    Submit to a challenge
// @route   POST /api/challenges/:id/submit
// @access  Private
export const submitToChallenge = async (req, res) => {
  try {
    const { postId } = req.body
    const challenge = await Challenge.findById(req.params.id)

    if (!challenge) return res.status(404).json({ success: false, message: 'Musobaqa topilmadi' })
    if (!challenge.isActive) return res.status(400).json({ success: false, message: 'Musobaqa tugagan' })

    // Check if user already submitted
    const alreadySubmitted = challenge.submissions.some(
      s => s.user.toString() === req.user._id.toString()
    )
    if (alreadySubmitted) return res.status(400).json({ success: false, message: 'Siz allaqachon qatnashgansiz' })

    challenge.submissions.push({ user: req.user._id, post: postId, votes: [] })
    await challenge.save()

    // Award points for participation
    try {
      await pointsService.addPoints(req.user._id, 50, {
        source: 'challenge',
        description: `"${challenge.title}" musobaqasiga qatnashdi`,
        referenceId: challenge._id,
        referenceModel: 'Challenge'
      })
    } catch (err) {
      logger.error('Error awarding challenge participation points:', err)
    }

    logger.info(`User ${req.user._id} submitted to challenge ${challenge._id}`)
    res.json({ success: true, message: 'Muvaffaqiyatli qatnashdingiz! +50 ball' })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

// @desc    Vote on a submission
// @route   POST /api/challenges/:id/vote/:submissionId
// @access  Private
export const voteOnSubmission = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
    if (!challenge) return res.status(404).json({ success: false, message: 'Musobaqa topilmadi' })

    const submission = challenge.submissions.id(req.params.submissionId)
    if (!submission) return res.status(404).json({ success: false, message: 'Taqdimot topilmadi' })

    // Can't vote on own submission
    if (submission.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'O\'z obrazingizga ovoz bera olmaysiz' })
    }

    const voteIndex = submission.votes.indexOf(req.user._id)
    if (voteIndex > -1) {
      submission.votes.splice(voteIndex, 1) // Remove vote (toggle)
    } else {
      submission.votes.push(req.user._id)
    }

    await challenge.save()
    logger.info(`User ${req.user._id} voted on submission ${req.params.submissionId}`)
    res.json({ success: true, votesCount: submission.votes.length })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

// @desc    Set challenge winner
// @route   POST /api/challenges/:id/winner
// @access  Admin
export const setChallengeWinner = async (req, res) => {
  try {
    const { userId } = req.body
    const challenge = await Challenge.findById(req.params.id)

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Musobaqa topilmadi' })
    }

    if (challenge.isClosed) {
      return res.status(400).json({ success: false, message: 'Bu musobaqa allaqachon yopilgan' })
    }

    challenge.winner = userId
    challenge.isClosed = true
    challenge.isActive = false
    await challenge.save()

    // Award points to the winner based on challenge reward
    const rewardPoints = challenge.reward?.points || 100
    await pointsService.addPoints(userId, rewardPoints, {
      source: 'challenge',
      description: `Tabriklaymiz! Siz "${challenge.title}" musobaqasida g'olib bo'ldingiz`,
      referenceId: challenge._id,
      referenceModel: 'Challenge'
    })

    logger.info(`User ${userId} won challenge ${challenge._id}. Awarded ${rewardPoints} points.`)

    res.json({
      success: true,
      message: `G'olib belgilandi va ${rewardPoints} ball berildi!`,
      data: challenge
    })
  } catch (error) {
    logger.error('Set challenge winner error:', error)
    res.status(500).json({ success: false, message: 'Server xatosi' })
  }
}
