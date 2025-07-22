require('dotenv').config()
const Task = require("../models/TaskModel")
const { analyzeTranscript } = require("../services/geminiService")

// POST /api/tasks/analyze-transcript
const createTasksFromTranscript = async (req, res) => {
    const { transcript } = req.body
    // const userId = req.headers["x-user-id"] || "test-user" // use actual auth in prod

    // if (!transcript) return res.status(400).json({ error: "Missing transcript" })

    try {
        const parsedTasks = await analyzeTranscript(transcript)

        if (!Array.isArray(parsedTasks)) {
            return res.status(400).json({ error: "AI returned invalid format" })
        }

        const tasksToSave = parsedTasks.map(t => ({
            userId: "dummy",
            title: t.title,
            priority: t.priority, 
            completed: false
        }))

        const saved = await Task.insertMany(tasksToSave)

        res.status(201).json({ tasks: saved, tasksExtracted: saved?.length || 0 })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "AI processing failed" })
    }
}

// GET /api/tasks
const getPendingTasks = async (req, res) => {
    const userId = req.headers["x-user-id"] || "test-user"
    const tasks = await Task.find({ userId, completed: false })
    res.json(tasks)
}

// GET /api/tasks/completed
const getCompletedTasks = async (req, res) => {
    const userId = req.headers["x-user-id"] || "test-user"
    const tasks = await Task.find({ userId, completed: true })
    res.json(tasks)
}

// PATCH /api/tasks/:id/toggle
const toggleTaskCompletion = async (req, res) => {
    const { id } = req.params
    const task = await Task.findById(id)

    if (!task) return res.status(404).json({ error: "Task not found" })

    task.completed = !task.completed
    await task.save()

    res.json(task)
}

module.exports={
    createTasksFromTranscript,
    getPendingTasks,
    getCompletedTasks,
    toggleTaskCompletion
}
