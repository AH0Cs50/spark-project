// models/mlresults.model.js
import crypto from 'crypto';
import { MLResultsDB } from '../storage/db/collection.js';

/* =========================
   Utilities
========================= */

function generateObjectId() {
  return crypto.randomBytes(12).toString('hex');
}

function applyDefaults(result, isNew = true) {
  if (isNew) {
    result._id = generateObjectId();
    result.createdAt = new Date();
    if (!result.metrics) result.metrics = {};
    if (!result.outputFiles) result.outputFiles = [];
  }
  return result;
}

/* =========================
   Validation
========================= */

function validateMLResult(data, { isUpdate = false } = {}) {
  const errors = [];

  // jobId
  if (!isUpdate || data.jobId !== undefined) {
    if (!data.jobId || typeof data.jobId !== 'string') {
      errors.push('jobId is required and must be a string');
    }
  }

  // modelType
  if (!isUpdate || data.modelType !== undefined) {
    if (data.modelType && typeof data.modelType !== 'string') {
      errors.push('modelType must be a string');
    }
  }

  // metrics
  if (!isUpdate || data.metrics !== undefined) {
    if (data.metrics && typeof data.metrics !== 'object') {
      errors.push('metrics must be an object');
    }
  }

  // outputFiles
  if (!isUpdate || data.outputFiles !== undefined) {
    if (data.outputFiles && !Array.isArray(data.outputFiles)) {
      errors.push('outputFiles must be an array of strings');
    }
  }

  if (errors.length) {
    const err = new Error('MLResults validation failed');
    err.details = errors;
    throw err;
  }
}

/* =========================
   Model API (CRUD)
========================= */

export const MLResultsModel = {
  // CREATE
  async create(data) {
    validateMLResult(data);

    const result = {
      jobId: data.jobId,
      modelType: data.modelType,
      metrics: data.metrics,
      outputFiles: data.outputFiles
    };

    applyDefaults(result, true);

    return MLResultsDB.insert(result);
  },

  // READ
  async findById(id) {
    return MLResultsDB.findOne({ _id: id });
  },

  async findByJobId(jobId) {
    return MLResultsDB.find({ jobId });
  },

  // UPDATE
  async updateById(id, updates) {
    validateMLResult(updates, { isUpdate: true });

    applyDefaults(updates, false);

    return MLResultsDB.update(
      { _id: id },
      { $set: updates },
      { returnUpdatedDocs: true }
    );
  },

  // DELETE
  async deleteById(id) {
    return MLResultsDB.remove({ _id: id });
  }
};