import OpenAI from 'openai'
import Product from '../models/product.model.js'
import logger from '../utils/logger.js'

class AIStylistService {
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      logger.warn('OPENAI_API_KEY not set. AI stylist will use mock responses.')
      this.openai = null
      return
    }
    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    })
    this.model = 'gpt-4o-mini'
    this.systemPrompt = `You are a professional fashion stylist for LUXE, a premium women's fashion boutique in Uzbekistan. 
You help customers create stylish outfits based on their preferences, occasion, body type, and budget.
You have access to the store's inventory and can suggest specific products.
Always be helpful, friendly, and fashion-forward.
If asked about specific products, you can mention they are available in the store.
Keep responses concise but informative.`
  }

  async getChatResponse(message, context = {}) {
    if (!this.openai) {
      return this.getMockChatResponse(message)
    }
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...(context.history || []),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
      return completion.choices[0].message.content
    } catch (error) {
      logger.error('OpenAI chat error:', error)
      return this.getMockChatResponse(message)
    }
  }

  getMockChatResponse(message) {
    const lowerMsg = message.toLowerCase()
    if (lowerMsg.includes('occasion') || lowerMsg.includes('party') || lowerMsg.includes('wedding') || lowerMsg.includes('mehmonxona')) {
      return "Mehmonxona uchun: pastel rangdagi atlas ko'ylak, befoyka buxoro duppasi, teslim bashmaq va minimalist g'alto. LUXE da bu uslubdagi ko'ylaklar va aksessuarlar mavjud."
    }
    if (lowerMsg.includes('office') || lowerMsg.includes('work') || lowerMsg.includes('ish')) {
      return "Ofis uchun: klassik bek ko'ylak, trouser kostyum, neytral rangdagi blazer va loferlar. Bizning 'Corporate' kolleksiyasidan tanlashingiz mumkin."
    }
    if (lowerMsg.includes('date') || lowerMsg.includes('date') || lowerMsg.includes('romantic')) {
      return "Romantik uchrashuv uchun: qizil atlas ko'ylak, o'rtacha bosqichi, teslim bashmaq va yengil arg'am. LUXE da romantik ko'ylaklar kolleksiyasini tekshiring."
    }
    return "LUXE hujjatida siz uchun 개인 취향과 occasion에 맞는 스타일을 제안해 드립니다. 구체적인 상황을 알려주시면 더 정확한 스타일링을 도와드릴 수 있습니다. (Korean fallback for demo)"
  }

  async generateOutfit(occasion, preferences, budget) {
    if (!this.openai) {
      return this.getMockOutfit(occasion, preferences, budget)
    }
    try {
      let products = []
      if (occasion) {
        products = await Product.find({}).limit(20).lean()
      }

      const productsSummary = products
        .map(p => `${p.name} (${p.category}) - ${p.price} so'm`)
        .slice(0, 10)
        .join('\n')

      const prompt = `As a fashion stylist, create an outfit for the following:
Occasion: ${occasion}
Preferences: ${preferences || 'No specific preferences'}
Budget: ${budget || 'Not specified'} so'm

Available products in store (examples):
${productsSummary}

Provide:
1. A complete outfit description (top, bottom, shoes, accessories)
2. Specific product suggestions from the store (if possible)
3. Styling tips
4. Estimated total cost

Keep it practical and stylish.`
      
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 800
      })
      
      return completion.choices[0].message.content
    } catch (error) {
      logger.error('Outfit generation error:', error)
      return this.getMockOutfit(occasion, preferences, budget)
    }
  }

  getMockOutfit(occasion, preferences, budget) {
    let outfit = "LOOK 1: Pastel atlas ko'ylak + befoyka duppas + teslim bashmaq\n"
    outfit += "LOOK 2: Klassik bek ko'ylak + trouser + neytral blazer\n"
    if (budget && parseInt(budget) > 500000) {
      outfit += "PREMIUM: Qora velvet kotli + pyetek doppa + beluchi kemer\n"
    }
    return outfit + "\nStil tavsifi: Rang armoniyasi va dostlik ni unutmang!"
  }

  async getStyleAdvice(query) {
    if (!this.openai) {
      return this.getMockStyleAdvice(query)
    }
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 400
      })
      return completion.choices[0].message.content
    } catch (error) {
      logger.error('Style advice error:', error)
      return this.getMockStyleAdvice(query)
    }
  }

  getMockStyleAdvice(query) {
    const lower = query.toLowerCase()
    if (lower.includes('rang') || lower.includes('color')) {
      return "Neutral ranglar (bek, qora, oq) har bir rang bilan mos keladi. Och ko'k va pension ranglari ravishda yangilik manzili."
    }
    if (lower.includes('kiyish') || lower.includes('fit')) {
      return "Sherik kostyum hammasiga moyil emas. O'zingizni o'lchang va brend o'lcham jadvalini solishtiring."
    }
    return "Umumiy tavsiya: Bir necha klassik parni kelтинг bilan kombinatsiya qiling va har kuni yangi tasvir yarating."
  }
}

export default new AIStylistService()