require('dotenv').config()
const Task = require("../models/TaskModel")
const { analyzeTranscript } = require("../services/geminiService")

// POST /api/tasks/analyze-transcript
const createTasksFromTranscript = async (req, res) => {
    const userId = req.auth.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" })
    const { transcript } = req.body
    if (!transcript) return res.status(400).json({ error: "Missing transcript" })

    try {
        const parsedTasks = await analyzeTranscript(transcript)

        if (!Array.isArray(parsedTasks)) {
            return res.status(400).json({ error: "Something went wrong." })
        }

        const tasksToSave = parsedTasks.map(t => ({
            userId: userId,
            title: t.title,
            priority: t.priority,
            completed: false
        }))

        const saved = await Task.insertMany(tasksToSave)
        if (!saved || saved.length === 0) {
            return res.status(400).json({ extractedTasks: 0, error: "Oops! Our AI was unable to analyze your audio. Try speaking clearly in English or recording in a peaceful environment." })
        }

        res.status(201).json({ message: "🎉 Wohoo! Successfully analyzed your audio.", tasksExtracted: saved?.length || 0, saved })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Audio analysis failed." })
    }
}

// GET /api/tasks
const getPendingTasks = async (req, res) => {
    const userId = req.auth.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" })
    const tasks = await Task.find({ userId, completed: false })
    res.json(tasks)
}

// GET /api/tasks/completed
const getCompletedTasks = async (req, res) => {
    const userId = req.auth.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" })
    const tasks = await Task.find({ userId, completed: true })
    res.json(tasks)
}

// PATCH /api/tasks/:id/toggle
const toggleTaskCompletion = async (req, res) => {
    const userId = req.auth.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" })
    const { id } = req.params
    const task = await Task.findOne({ taskId: id })

    if (!task) return res.status(404).json({ error: "Task not found" })

    task.completed = true
    task.completedOn = new Date() || null
    await task.save()

    res.json(task)
}

module.exports = {
    createTasksFromTranscript,
    getPendingTasks,
    getCompletedTasks,
    toggleTaskCompletion
}
