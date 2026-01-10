//routes/dataset.routes.js
import { Router } from 'express';
import  upload  from '../middlewares/upload.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadDatasetController } from '../controller/dataset.controller.js';

const router = Router();

/**
 * Upload Dataset
 * POST /datasets/upload
 * Form-data: file, userId
 */
router.post('/upload', authMiddleware, upload.single('file'), uploadDatasetController);

export default router;