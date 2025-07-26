const mongoose = require("mongoose")
const { v4: uuidv4 } = require("uuid")

const taskSchema = new mongoose.Schema({
    userId: String,
    taskId: {
        type: String,
        default: () => uuidv4(),
        unique: true,
    },
    title: String,
    priority: { type: String, enum: ["urgent", "regular", "weekly"] },
    completed: { type: Boolean, default: false },
    completedOn: { type: Date, default: null }
}, { timestamps: true })

module.exports = mongoose.model("Task", taskSchema)
