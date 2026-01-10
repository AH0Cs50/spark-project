import { Router } from 'express';
import { signUp, signIn, signOut } from '../controller/auth.controller.js';
import {authMiddleware} from '../middlewares/auth.middleware.js';

const authRouter = Router();

//Sub-endpoints from main api/v1/auth/
authRouter.post('/sign-up', signUp);
authRouter.post('/sign-in', signIn);
authRouter.post('/sign-out',authMiddleware, signOut);//need for authintication

export default authRouter;
