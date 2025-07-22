const express = require("express")
const router = express.Router()
const {
    createTasksFromTranscript,
    getPendingTasks,
    getCompletedTasks,
    toggleTaskCompletion
} = require("../controllers/taskController")

router.post("/analyze-transcript", createTasksFromTranscript)
router.get("/", getPendingTasks)
router.get("/completed", getCompletedTasks)
router.patch("/:id/toggle", toggleTaskCompletion)

module.exports = router
