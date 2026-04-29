import Points from '../models/points.model.js'
import Badge from '../models/badge.model.js'
import Order from '../models/order.model.js'
import User from '../models/user.model.js'
import UserBadge from '../models/userBadge.model.js'
import PointTransaction from '../models/pointTransaction.model.js'
import Coupon from '../models/coupon.model.js'
import logger from '../utils/logger.js'

class PointsService {
  // VIP levels based on total earned points
  static VIP_LEVELS = [
    { threshold: 0, level: 'Bronze', discount: 0, earlyAccess: false, freeShipping: true },
    { threshold: 300, level: 'Silver', discount: 5, earlyAccess: false, freeShipping: true },
    { threshold: 650, level: 'Gold', discount: 10, earlyAccess: true, freeShipping: true },
    { threshold: 1000, level: 'Diamond', discount: 15, earlyAccess: true, freeShipping: true }
  ];

  async getOrCreatePoints(userId) {
    let points = await Points.findOne({ user: userId });
    if (!points) {
      points = await Points.create({ user: userId, balance: 0, totalEarned: 0, totalSpent: 0, level: 'Bronze' });
      logger.info(`Created points record for user ${userId}`);
    }
    return points;
  }

  async addPoints(userId, amount, reason) {
    try {
      const points = await this.getOrCreatePoints(userId);
      points.balance += amount;
      points.totalEarned += amount;

      // Update VIP level based on totalEarned (Level only goes up)
      const newLevel = this.calculateVIPLevel(points.totalEarned);
      if (this.isLevelHigher(newLevel, points.level)) {
        const oldLevel = points.level;
        points.level = newLevel;
        logger.info(`User ${userId} VIP level upgraded to ${newLevel}`);
        
        // Award coupon for new level
        await this.awardLevelCoupon(userId, newLevel);
      }

      await points.save();

      // Create transaction record
      await PointTransaction.create({
        user: userId,
        amount: amount,
        type: 'earned',
        source: reason.source || 'admin',
        description: reason.description || 'Points added',
        referenceId: reason.referenceId || null,
        referenceModel: reason.referenceModel || null
      });

      // Check for badge awards
      await this.checkAndAwardBadges(userId, points);

      logger.info(`Added ${amount} points to user ${userId}. New balance: ${points.balance}`);
      return { success: true, points: points, newLevel: points.level };
    } catch (error) {
      logger.error('Error adding points:', error);
      throw error;
    }
  }

  async deductPoints(userId, amount, reason, decreaseTotal = true) {
    try {
      const points = await this.getOrCreatePoints(userId);
      // We allow negative balance if needed, but usually we cap it at 0
      points.balance = Math.max(0, points.balance - amount);
      
      // Decrease totalEarned for cancellations/errors to prevent level exploitation
      if (decreaseTotal) {
        points.totalEarned = Math.max(0, points.totalEarned - amount);
        // Level might drop if totalEarned decreases due to cancellation/correction
        const newLevel = this.calculateLevel(points.totalEarned);
        points.level = newLevel;
      }

      await points.save();

      // Create transaction record
      await PointTransaction.create({
        user: userId,
        amount: -amount,
        type: 'spent',
        source: reason.source || 'admin',
        description: reason.description || 'Points deducted',
        referenceId: reason.referenceId || null,
        referenceModel: reason.referenceModel || null
      });

      logger.info(`Deducted ${amount} points from user ${userId}. New balance: ${points.balance}`);
      return { success: true, points: points };
    } catch (error) {
      logger.error('Error deducting points:', error);
      throw error;
    }
  }

  async spendPoints(userId, amount) {
    try {
      const points = await this.getOrCreatePoints(userId);
      if (points.balance < amount) {
        return { success: false, message: 'Insufficient points' };
      }
      points.balance -= amount;
      points.totalSpent += amount;
      await points.save();
      
      // Create transaction record
      await PointTransaction.create({
        user: userId,
        amount: amount,
        type: 'spent',
        source: 'checkout',
        description: 'Points spent on purchase',
      });
      
      logger.info(`Spent ${amount} points from user ${userId}. New balance: ${points.balance}`);
      return { success: true, points: points };
    } catch (error) {
      logger.error('Error spending points:', error);
      throw error;
    }
  }

  calculateVIPLevel(totalEarned) {
    let level = 'Bronze';
    for (const tier of PointsService.VIP_LEVELS) {
      if (totalEarned >= tier.threshold) {
        level = tier.level;
      } else {
        break;
      }
    }
    return level;
  }

  isLevelHigher(newLevel, oldLevel) {
    const levels = ['Bronze', 'Silver', 'Gold', 'Diamond'];
    return levels.indexOf(newLevel) > levels.indexOf(oldLevel);
  }

  getVIPBenefits(level) {
    const tier = PointsService.VIP_LEVELS.find(t => t.level === level) || PointsService.VIP_LEVELS[0];
    return {
      discount: tier.discount,
      earlyAccess: tier.earlyAccess,
      freeShipping: tier.freeShipping
    };
  }

  async checkAndAwardBadges(userId, points) {
    try {
      // Get user stats
      const user = await User.findById(userId);
      const orderCount = await Order.countDocuments({ user: userId });
      const reviewCount = await Order.countDocuments({ user: userId, 'items.0': { $exists: true } }); // Approximate
      // Actually, we should have a review model, but for now we'll skip or use a placeholder

      // For simplicity, we'll award badges based on points and order count
      const badges = await Badge.find({ isActive: true });

      for (const badge of badges) {
        // Check if user already has this badge
        const hasBadge = await UserBadge.findOne({ user: userId, badge: badge._id });
        if (hasBadge) continue; // Skip if already earned

        let earned = false;
        switch (badge.criteria) {
          case 'purchase_amount':
            earned = points.totalEarned >= badge.threshold;
            break;
          case 'number_of_orders':
            earned = orderCount >= badge.threshold;
            break;
          case 'reviews_written':
            earned = reviewCount >= badge.threshold;
            break;
          case 'days_streak':
            earned = false;
            break;
          case 'social_shares':
            earned = false;
            break;
          case 'referral_count':
            earned = false;
            break;
          default:
            earned = false;
        }

        if (earned) {
          await UserBadge.create({ user: userId, badge: badge._id });
          logger.info(`User ${userId} has earned badge: ${badge.name}`);
          
          if (badge.reward.points > 0) {
            await this.addPoints(userId, badge.reward.points, { source: 'challenge', description: `Earned badge: ${badge.name}` });
          }
        }
      }
    } catch (error) {
      logger.error('Error checking badges:', error);
    }
  }

  async getLeaderboard(limit = 10) {
    try {
      const leaderboard = await Points.find()
        .sort({ balance: -1 })
        .limit(limit)
        .populate('user', 'username phone')
        .lean();
      return leaderboard;
    } catch (error) {
      logger.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  async getTransactions(userId, limit = 20) {
    try {
      return await PointTransaction.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      logger.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async awardLevelCoupon(userId, level) {
    try {
      let discountValue = 0;
      if (level === 'Silver') discountValue = 5;
      else if (level === 'Gold') discountValue = 10;
      else if (level === 'Diamond') discountValue = 20;
      else return; // No coupon for Bronze

      const code = `VIP${level.toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      await Coupon.create({
        code,
        user: userId,
        discountType: 'percentage',
        discountValue,
        minPurchase: level === 'Silver' ? 500000 : level === 'Gold' ? 1000000 : 2000000,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        description: `VIP ${level} darajasiga erishganingiz uchun maxsus sovg'a!`
      });

      logger.info(`Awarded ${level} coupon to user ${userId}: ${code}`);
    } catch (error) {
      logger.error('Error awarding level coupon:', error);
    }
  }
}

export default new PointsService();