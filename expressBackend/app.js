//server here
import { config } from 'dotenv';
config({ path: './config.env' });
//backend app
import express from 'express';
//routers
import authRouter from './routes/auth.route.js';
import datasetRouter from './routes/dataset.route.js';
import jobRouter from './routes/job.route.js';
//middlewares
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/error.middleware.js';
import { authMiddleware } from './middlewares/auth.middleware.js';


const App = express();

//APP CONSTRUCTION

App.use(express.json());
App.use(express.urlencoded({ extended: true }));
App.use(cookieParser());

//public routes
App.use('/api/v1/auth', authRouter);

//protected routes
App.use('/api/v1/dataset/', datasetRouter);
App.use('/api/v1/job/',authMiddleware,jobRouter);

//error middleware
App.use(errorHandler);

async function appStarting() {
    try {
        const Port = process.env.PORT || 5000;
        App.listen(Port, () => {
            console.log("server start listening at port:" + Port);
        })
    } catch (err) {
        console.log('error: ' + err);
    }
}


appStarting();

