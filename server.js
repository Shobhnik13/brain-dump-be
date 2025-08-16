require('dotenv').config()

const express = require("express")
const cors = require("cors")
const taskRoutes = require("./routes/taskRoutes")
const connectDB = require("./config/db")
const morgan = require('morgan');
const chalk = require('chalk');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node')

const app = express()

// Custom morgan tokens
morgan.token('urlOnly', (req) => req.originalUrl);
morgan.token('statusColored', (req, res) => {
    const status = res.statusCode;
    if (status >= 500) return chalk.red(status);
    if (status >= 400) return chalk.yellow(status);
    if (status >= 300) return chalk.cyan(status);
    if (status >= 200) return chalk.green(status);
    return status;
});
morgan.token('timestamp', () => new Date().toISOString());

// Logging format
const format = '[:timestamp] :method :urlOnly :statusColored :response-time ms';
const skipOptions = (req) => req.method === 'OPTIONS';

// middlewares
app.use(morgan(format, { skip: skipOptions }));
// cors config prod+local+http/https
const allowedOrigins = ["http://localhost:5004", "https://mybraindump.api.shobhnik.xyz"]
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        return callback(new Error("Not allowed by CORS"))
    },
    credentials: true,
}))

app.use(express.json())

// health route
app.get('/health', (req, res) => {
    res.status(200).json({ message: "OK" })
})

// routes
app.use("/api/v1/tasks", taskRoutes)


const PORT = process.env.PORT

const startServer = async () => {
    try {
        await connectDB()
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`)
        })
    } catch (err) {
        console.error("Error starting server:", err)
        process.exit(1)
    }
}

startServer()