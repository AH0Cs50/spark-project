// models/statistics.model.js
import crypto from 'crypto';
import { StatisticsDB } from '../storage/db/collection.js';

/* =========================
   Utilities
========================= */

function generateObjectId() {
  return crypto.randomBytes(12).toString('hex');
}

function applyDefaults(stat, isNew = true) {
  if (isNew) {
    stat._id = generateObjectId();
    stat.createdAt = new Date();
  }
  return stat;
}

/* =========================
   Validation
========================= */

function validateStatistics(data, { isUpdate = false } = {}) {
  const errors = [];

  // jobId
  if (!isUpdate || data.jobId !== undefined) {
    if (!data.jobId || typeof data.jobId !== 'string') {
      errors.push('jobId is required and must be a string');
    }
  }

  // statistics object
  if (!isUpdate || data.statistics !== undefined) {
    if (data.statistics !== undefined && typeof data.statistics !== 'object') {
      errors.push('statistics must be an object');
    }
  }

  if (errors.length) {
    const err = new Error('Statistics validation failed');
    err.details = errors;
    throw err;
  }
}

/* =========================
   Model API (CRUD)
========================= */

export const StatisticsModel = {
  // CREATE
  async create(data) {
    validateStatistics(data);

    const stat = {
      jobId: data.jobId,
      statistics: data.statistics || {}
    };

    applyDefaults(stat, true);

    return StatisticsDB.insert(stat);
  },

  // READ
  async findById(id) {
    return StatisticsDB.findOne({ _id: id });
  },

  async findByJobId(jobId) {
    return StatisticsDB.find({ jobId });
  },

  // UPDATE
  async updateById(id, updates) {
    validateStatistics(updates, { isUpdate: true });

    applyDefaults(updates, false);

    return StatisticsDB.update(
      { _id: id },
      { $set: updates },
      { returnUpdatedDocs: true }
    );
  },

  // DELETE
  async deleteById(id) {
    return StatisticsDB.remove({ _id: id });
  }
};