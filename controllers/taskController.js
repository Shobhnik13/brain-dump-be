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
            completed: false,
            isDeleted: false,
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
    const tasks = await Task.find({ userId, completed: false, isDeleted: false })
    res.json(tasks)
}

// GET /api/tasks/completed
const getCompletedTasks = async (req, res) => {
    const userId = req.auth.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" })
    const tasks = await Task.find({ userId, completed: true, isDeleted: false })
    res.json(tasks)
}

// PATCH /api/tasks/:id/toggle
const toggleTaskCompletion = async (req, res) => {
    const userId = req.auth.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" })
    const { id } = req.params
    const task = await Task.findOne({ taskId: id, completed: false, isDeleted: false })

    if (!task) return res.status(404).json({ error: "Task not found" })

    task.completed = true
    task.completedOn = new Date() || null
    await task.save()

    res.json(task)
}


const updateTask = async (req, res) => {
    const userId = req.auth.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" })
    const { id } = req.params

    const task = await Task.findOne({ taskId: id, isDeleted: false })
    if (!task) return res.status(404).json({ error: "Task not found" })

    const { title } = req.body
    if (!title) return res.status(400).json({ error: "Missing title" })
    const sanitizedTitle = title.trim().replace(/[^a-zA-Z0-9\s]/g, "")

    if (sanitizedTitle.length < 3) {
        return res.status(400).json({ error: "Title must be at least 3 characters long" })
    }
    if (task?.title === sanitizedTitle) {
        return res.status(400).json({ error: "You can not update with same title" })
    }

    task.title = sanitizedTitle
    await task.save()

    res.status(200).json({ message: "Task updated successfully" })
}

// clear all completd ones
const clearAllCompletedTask = async (req, res) => {
    const userId = req.auth.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" })
    try {
        const tasksToDelete = await Task.find({ userId, completed: true, isDeleted: false })
        if (tasksToDelete.length === 0) {
            return res.status(404).json({ error: "You must complete task before deleting it" })
        }
        // Delete all completed tasks for the user
        await Task.updateMany({
            userId,
            completed: true,
            isDeleted: false,
        }, {
            $set: { isDeleted: true }
        }
        )
        res.json({ message: "All tasks deleted successfully" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to clear completed tasks" })
    }
}

// Redo task
const redoTask = async (req, res) => {
    const userId = req.auth.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" })
    const { taskId } = req.params

    try {
        const task = await Task.findOne({ userId, taskId, isDeleted: false, completed: true })
        if (!task) return res.status(404).json({ error: "Task not found" })

        // Restore the task by setting isDeleted to false
        task.completed = false
        await task.save()

        res.json({ message: "Task added again" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to restore task" })
    }
}
module.exports = {
    createTasksFromTranscript,
    getPendingTasks,
    getCompletedTasks,
    toggleTaskCompletion,
    updateTask,
    clearAllCompletedTask,
    redoTask
}
