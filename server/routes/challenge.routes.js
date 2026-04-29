import express from 'express'
import {
  getAllChallenges,
  getActiveChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  submitToChallenge,
  voteOnSubmission,
  setChallengeWinner
} from '../controllers/challenge.controller.js'
import { protect, admin } from '../middleware/auth.middleware.js'

const router = express.Router()

router.route('/')
  .get(getAllChallenges)
  .post(protect, admin, createChallenge)

router.get('/active', getActiveChallenges)

router.route('/:id')
  .put(protect, admin, updateChallenge)
  .delete(protect, admin, deleteChallenge)

router.post('/:id/submit', protect, submitToChallenge)
router.post('/:id/vote/:submissionId', protect, voteOnSubmission)
router.post('/:id/winner', protect, admin, setChallengeWinner)

export default router
