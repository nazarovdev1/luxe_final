import express from 'express'

const app = express()
const PORT = 3003

app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'Server is working!' })
})

app.get('/api/products', (req, res) => {
    res.json({ success: true, data: [] })
})

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT)
})
