// controllers/dataset.controller.js
import DatasetService from '../services/dataset.service.js';

/**
 * POST /datasets/upload
 */
export const uploadDatasetController = async (req, res) => {
  try {
    const userId = req.user._id;
    const file = req.file;
    //validation about request
    if (!file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const dataset = await DatasetService.uploadDataset(userId, file);

    return res.status(201).json({
      message: 'Dataset uploaded successfully',
      dataset
    });
  } catch (error) {
    console.error('Upload Dataset Error:', error);
    return res.status(500).json({
      error: 'Failed to upload dataset',
      details: error.message
    });
  }
};