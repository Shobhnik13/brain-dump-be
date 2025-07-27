const express = require("express")
const router = express.Router()
const {
    createTasksFromTranscript,
    getPendingTasks,
    getCompletedTasks,
    toggleTaskCompletion
} = require("../controllers/taskController")
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node")

router.post("/analyze-transcript", ClerkExpressRequireAuth(), createTasksFromTranscript)
router.get("/", ClerkExpressRequireAuth(), getPendingTasks)
router.get("/completed", ClerkExpressRequireAuth(), getCompletedTasks)
router.patch("/:id/toggle", ClerkExpressRequireAuth(), toggleTaskCompletion)

module.exports = router
