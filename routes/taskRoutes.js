const express = require("express")
const router = express.Router()
const {
    createTasksFromTranscript,
    getPendingTasks,
    getCompletedTasks,
    toggleTaskCompletion,
    updateTask,
    clearAllCompletedTask
} = require("../controllers/taskController")
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node")

router.post("/analyze-transcript", ClerkExpressRequireAuth(), createTasksFromTranscript)
router.get("/", ClerkExpressRequireAuth(), getPendingTasks)
router.get("/completed", ClerkExpressRequireAuth(), getCompletedTasks)
router.patch("/:id/toggle", ClerkExpressRequireAuth(), toggleTaskCompletion)
router.patch('/:id/update', ClerkExpressRequireAuth(), updateTask)
router.post('/clear-all', ClerkExpressRequireAuth(), clearAllCompletedTask)
module.exports = router
