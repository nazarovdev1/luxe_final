import sharp from 'sharp'
import axios from 'axios'
import Product from '../models/product.model.js'
import logger from '../utils/logger.js'

class VisualSearchService {
  getImageUrl(product) {
    if (!product.images || product.images.length === 0) return null
    const firstImage = product.images[0]
    
    // Case 1: Standard { url: "..." }
    if (firstImage.url) return firstImage.url
    
    // Case 2: String directly
    if (typeof firstImage === 'string') return firstImage
    
    // Case 3: Messed up object with char keys (e.g., { "0": "h", "1": "t", ... })
    if (firstImage['0']) {
      return Object.keys(firstImage)
        .filter(k => !isNaN(k))
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(k => firstImage[k])
        .join('')
    }
    
    return null
  }

  async extractColorPalette(imageBuffer, colorCount = 6) {
    try {
      const { data, info } = await sharp(imageBuffer)
        .resize(100, 100, { fit: 'cover' })
        .raw()
        .toBuffer({ resolveWithObject: true })

      const pixels = []
      for (let i = 0; i < data.length; i += info.channels) {
        pixels.push([data[i], data[i + 1], data[i + 2]])
      }

      const palette = this.kMeansClustering(pixels, colorCount)

      const totalPixels = pixels.length
      const colorVector = palette.map((cluster) => ({
        r: Math.round(cluster.centroid[0]),
        g: Math.round(cluster.centroid[1]),
        b: Math.round(cluster.centroid[2]),
        hex: this.rgbToHex(cluster.centroid[0], cluster.centroid[1], cluster.centroid[2]),
        name: this.getColorName(cluster.centroid[0], cluster.centroid[1], cluster.centroid[2]),
        percentage: Math.round((cluster.count / totalPixels) * 100)
      }))

      return colorVector.sort((a, b) => b.percentage - a.percentage)
    } catch (error) {
      logger.error('Color extraction error:', error)
      throw error
    }
  }

  async extractStructureVector(imageBuffer) {
    try {
      const { data } = await sharp(imageBuffer)
        .resize(8, 8, { fit: 'fill' })
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true })
      
      // Convert 0-255 to 0-1 range
      const vector = []
      for (let i = 0; i < data.length; i++) {
        vector.push(data[i] / 255)
      }
      return vector
    } catch (error) {
      logger.error('Structure extraction error:', error)
      return []
    }
  }

  kMeansClustering(pixels, k, maxIterations = 20) {
    const centroids = []
    const step = Math.floor(pixels.length / k)
    for (let i = 0; i < k; i++) {
      centroids.push([...pixels[i * step]])
    }

    let assignments = new Array(pixels.length).fill(0)

    for (let iter = 0; iter < maxIterations; iter++) {
      for (let i = 0; i < pixels.length; i++) {
        let minDist = Infinity
        let closest = 0
        for (let j = 0; j < centroids.length; j++) {
          const dist = this.colorDistance(pixels[i], centroids[j])
          if (dist < minDist) {
            minDist = dist
            closest = j
          }
        }
        assignments[i] = closest
      }

      const newCentroids = centroids.map(() => ({ sum: [0, 0, 0], count: 0 }))
      for (let i = 0; i < pixels.length; i++) {
        const c = assignments[i]
        newCentroids[c].sum[0] += pixels[i][0]
        newCentroids[c].sum[1] += pixels[i][1]
        newCentroids[c].sum[2] += pixels[i][2]
        newCentroids[c].count++
      }

      let converged = true
      for (let j = 0; j < centroids.length; j++) {
        if (newCentroids[j].count === 0) continue
        const newC = [
          newCentroids[j].sum[0] / newCentroids[j].count,
          newCentroids[j].sum[1] / newCentroids[j].count,
          newCentroids[j].sum[2] / newCentroids[j].count
        ]
        if (this.colorDistance(centroids[j], newC) > 5) converged = false
        centroids[j] = newC
      }
      if (converged) break
    }

    const clusterCounts = new Array(k).fill(0)
    assignments.forEach((a) => clusterCounts[a]++)

    return centroids.map((centroid, i) => ({
      centroid,
      count: clusterCounts[i]
    }))
  }

  colorDistance(a, b) {
    const dr = a[0] - b[0]
    const dg = a[1] - b[1]
    const db = a[2] - b[2]
    return Math.sqrt(dr * dr + dg * dg + db * db)
  }

  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')
  }

  getColorName(r, g, b) {
    const hsl = this.rgbToHsl(r, g, b)
    const h = hsl[0]
    const s = hsl[1]
    const l = hsl[2]

    if (l < 15) return 'black'
    if (l > 85 && s < 15) return 'white'
    if (s < 15) {
      if (l < 40) return 'dark gray'
      if (l < 60) return 'gray'
      return 'light gray'
    }

    if (h < 15 || h >= 345) return 'red'
    if (h < 45) return 'orange'
    if (h < 65) return 'yellow'
    if (h < 160) return 'green'
    if (h < 200) return 'cyan'
    if (h < 260) return 'blue'
    if (h < 300) return 'purple'
    return 'pink'
  }

  rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60
      else if (max === g) h = ((b - r) / d + 2) * 60
      else h = ((r - g) / d + 4) * 60
      return [h, s * 100, l * 100]
    }
    return [0, 0, l * 100]
  }

  paletteToVector(palette) {
    const vector = new Array(30).fill(0)
    palette.forEach((color, i) => {
      if (i >= 10) return
      vector[i * 3] = color.r / 255 * (color.percentage / 100)
      vector[i * 3 + 1] = color.g / 255 * (color.percentage / 100)
      vector[i * 3 + 2] = color.b / 255 * (color.percentage / 100)
    })
    return vector
  }

  cosineSimilarity(a, b) {
    let dotProduct = 0
    let normA = 0
    let normB = 0
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * (b[i] || 0)
      normA += a[i] * a[i]
      normB += (b[i] || 0) * (b[i] || 0)
    }
    if (normA === 0 || normB === 0) return 0
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  async findSimilarByColor(imageBuffer, limit = 12) {
    try {
      const queryPalette = await this.extractColorPalette(imageBuffer)
      const queryColorVector = this.paletteToVector(queryPalette)
      const queryStructureVector = await this.extractStructureVector(imageBuffer)

      const products = await Product.find({})
        .select('name price originalPrice category badge rating images colors colorVector colorPalette structureVector description')
        .lean()

      const results = products
        .map((product) => {
          let colorSimilarity = 0
          let structureSimilarity = 0

          // 1. Color Similarity (40%)
          if (product.colorVector && product.colorVector.length > 0) {
            colorSimilarity = this.cosineSimilarity(queryColorVector, product.colorVector)
          }

          // 2. Structure/Shape Similarity (40%)
          if (product.structureVector && product.structureVector.length > 0 && queryStructureVector.length > 0) {
            structureSimilarity = this.cosineSimilarity(queryStructureVector, product.structureVector)
          }

          // 3. Color Name Matching (20%)
          const colorNameMatch = this.matchColorNames(queryPalette, product)

          // Combined score
          const similarity = (colorSimilarity * 0.4) + (structureSimilarity * 0.4) + (colorNameMatch * 0.2)

          return { ...product, similarity }
        })
        .filter((p) => p.similarity > 0.15)
        .sort((a, b) => b.similarity - a.similarity)
        .map(p => ({
          ...p,
          mainImage: this.getImageUrl(p)
        }))
        .slice(0, limit)

      return {
        success: true,
        queryPalette,
        results
      }
    } catch (error) {
      logger.error('Visual search error:', error)
      return { success: false, error: error.message }
    }
  }

  matchColorNames(queryPalette, product) {
    if (!product.colorPalette || product.colorPalette.length === 0) {
      if (product.colors && product.colors.length > 0) {
        const queryNames = queryPalette.map((c) => c.name)
        const productColorNames = product.colors.map((c) => c.toLowerCase())
        let matches = 0
        for (const qn of queryNames) {
          for (const pc of productColorNames) {
            if (pc.includes(qn) || qn.includes(pc)) {
              matches++
              break
            }
          }
        }
        return matches / queryNames.length
      }
      return 0
    }

    let totalDist = 0
    let comparisons = 0
    for (const qc of queryPalette.slice(0, 3)) {
      let minDist = Infinity
      for (const pc of product.colorPalette) {
        const dist = this.colorDistance([qc.r, qc.g, qc.b], [pc.r, pc.g, pc.b])
        minDist = Math.min(minDist, dist)
      }
      totalDist += minDist
      comparisons++
    }
    if (comparisons === 0) return 0
    const avgDist = totalDist / comparisons
    return Math.max(0, 1 - avgDist / 442)
  }

  async findSimilarByProductId(productId, limit = 10) {
    try {
      const product = await Product.findById(productId).lean()
      if (!product) {
        return { success: false, error: 'Product not found' }
      }

      if (!product.colorVector || product.colorVector.length === 0) {
        return await Product.find({
          category: product.category,
          _id: { $ne: productId }
        })
          .select('name price originalPrice category badge rating images')
          .limit(limit)
          .lean()
          .then((r) => ({ success: true, results: r }))
      }

      const products = await Product.find({
        _id: { $ne: productId }
      })
        .select('name price originalPrice category badge rating images colorVector colorPalette colors')
        .lean()

      const results = products
        .map((p) => {
          let similarity = 0
          if (p.colorVector && p.colorVector.length > 0) {
            similarity = this.cosineSimilarity(product.colorVector, p.colorVector) * 0.6
          }
          if (p.category === product.category) similarity += 0.25
          if (p.colors && product.colors) {
            const commonColors = p.colors.filter((c) => product.colors.includes(c))
            similarity += (commonColors.length / Math.max(p.colors.length, 1)) * 0.15
          }
          return { ...p, similarity }
        })
        .filter((p) => p.similarity > 0.1)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)

      return { success: true, results }
    } catch (error) {
      logger.error('Find similar by product error:', error)
      return { success: false, error: error.message }
    }
  }

  async generateProductEmbedding(imageUrl) {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 15000
      })

      const buffer = Buffer.from(response.data)
      const palette = await this.extractColorPalette(buffer)
      const colorVector = this.paletteToVector(palette)
      const structureVector = await this.extractStructureVector(buffer)

      return { palette, colorVector, structureVector }
    } catch (error) {
      logger.error('Embedding generation error:', error)
      return { palette: [], colorVector: [], structureVector: [] }
    }
  }

  async batchGenerateEmbeddings() {
    try {
      const products = await Product.find({
        $or: [
          { colorVector: { $exists: false } },
          { colorVector: { $size: 0 } },
          { structureVector: { $exists: false } },
          { structureVector: { $size: 0 } }
        ]
      }).lean()

      logger.info(`Generating embeddings for ${products.length} products`)

      let processed = 0
      for (const product of products) {
        const imageUrl = this.getImageUrl(product)
        if (!imageUrl) continue

        try {
          const { palette, colorVector, structureVector } = await this.generateProductEmbedding(imageUrl)

          if (colorVector.length > 0) {
            await Product.findByIdAndUpdate(product._id, {
              colorPalette: palette,
              colorVector: colorVector,
              structureVector: structureVector
            })
            processed++
          }
        } catch (err) {
          logger.warn(`Failed to process product ${product._id}: ${err.message}`)
        }
      }

      logger.info(`Generated embeddings for ${processed} products`)
      return { success: true, processed, total: products.length }
    } catch (error) {
      logger.error('Batch embedding error:', error)
      return { success: false, error: error.message }
    }
  }
}

export default new VisualSearchService()