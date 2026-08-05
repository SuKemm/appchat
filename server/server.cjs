const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

let messages = [
    {
        id: 1,
        text: 'Tin nhắn từ backend',
        sender: 'server',
    },
]

app.get('/', (req, res) => {
    res.json({
        message: 'Messaging API is running',
    })
})

app.get('/api/messages', (req, res) => {
    res.json(messages)
})

app.post('/api/messages', (req, res) => {
    const { text, sender } = req.body

    if (!text || !text.trim()) {
        return res.status(400).json({
            message: 'Tin nhắn không được để trống',
        })
    }

    const newMessage = {
        id: Date.now(),
        text: text.trim(),
        sender: sender || 'user',
    }

    messages.push(newMessage)

    res.status(201).json(newMessage)
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`)
})