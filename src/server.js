import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';

//Import Routes
import taskRoutes from './routes/task.routes.js';
import authRoutes from './routes/auth.routes.js';
import e from 'cors';

//Create the Express application
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ok:true, name: 'todo-pwa-api'}));
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);

const {PORT = 4000, MONGO_URI} = process.env;

mongoose.connect(MONGO_URI)
.then(() => {
    app.listen(PORT, () => console.log(`Server connected to the database on port ${PORT}`));
})
.catch(err =>{
    console.error('Error connecting to the database', err);
    process.exit(1);
})