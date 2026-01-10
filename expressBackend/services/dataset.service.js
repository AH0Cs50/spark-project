import { uploadToS3 } from '../storage/cloud.crud.js';
import DatasetModel from '../model/dataset.model.js';

// File validation & extraction
const ALLOWED_TYPES = {
  pdf: 'application/pdf',
  csv: 'text/csv',
  txt: 'text/plain',
  json: 'application/json'
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

async function validateFile(file) {
  if (!file) throw new Error('File is required');

  let { originalname, mimetype, size, buffer } = file;
  let extension = originalname.split('.').pop().toLowerCase();
  
  // Extension check
  if (!ALLOWED_TYPES[extension])
    throw new Error(`Unsupported file type: ${extension}`);

  let mime = ALLOWED_TYPES[extension]||mimetype;

  console.log("======>>>"+extension,mime);
  console.log(file);

  // Size check
  if (size > MAX_FILE_SIZE)
    throw new Error('File exceeds maximum allowed size');

  return {
    fileType: extension,
    fileSize: size,
    safeFileName: originalname.replace(/[^a-zA-Z0-9._-]/g, '_'),
    mime //file mimetype
  };
}

const DatasetService = {

  async uploadDataset(userId, file) {
    // Validate file and get metadata
    const validatedFile = await validateFile(file);

    let fileContentBuffer = file.buffer;
    let contentType = validatedFile.mime;

    // Generate S3 storage path
    const storagePath = `datasets/${userId}/${Date.now()}-${validatedFile.safeFileName}`;

    try {
      const uploadResult = await uploadToS3({
        key: storagePath,
        body: fileContentBuffer, 
        contentType,
      });

      return await DatasetModel.create({
        userId,
        fileName: validatedFile.safeFileName,
        fileType: validatedFile.fileType,
        fileSize: validatedFile.fileSize,
        storagePath: uploadResult.location,
        status: 'uploaded',
      });

    } catch (error) {
      await DatasetModel.create({
        userId,
        fileName: validatedFile.safeFileName,
        fileType: validatedFile.fileType,
        fileSize: validatedFile.fileSize,
        storagePath,
        status: 'failed',
      });
      throw error;
    }
  },

  async getDatasetbyId (datasetID){
    const dataset = await DatasetModel.findById(datasetID);
    if(!dataset){
      const error= new Error("dataset not found");
      error.name='model error'
      throw error;
    }
    return dataset;
  },

  async getDatasetsbyUserId (userId){
    const datasets = await DatasetModel.findByUserId(userId);
    if(!datasets){
      const error= new Error("datasets not found by that user id");
      error.name='model error'
      throw error;
    }
    return datasets;
  }
};

export default DatasetService;