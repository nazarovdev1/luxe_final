import mongoose from 'mongoose'
import dotenv from 'dotenv'
import visualSearchService from './server/services/visualSearch.service.js'
import { connectDB } from './server/config/db.js'

dotenv.config()

async function run() {
  try {
    console.log('Connecting to DB...')
    await connectDB()
    console.log('Generating structural embeddings for all products...')
    const result = await visualSearchService.batchGenerateEmbeddings()
    console.log('Result:', result)
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

run()
