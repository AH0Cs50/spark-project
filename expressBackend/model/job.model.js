// models/job.model.js
import { JobsDB } from '../storage/db/collection.js';
import { generateObjectId, applyDefaults, Validators } from './util.model.js';

const jobSchema = {
  datasetId: { type: 'string', required: true },
  jobType: { type: 'enum', values: ['descriptive','ml'], required: true },
  parameters: { type: 'object' },
  status: { type: 'enum', values: ['pending','processing','completed','failed'] },
  resultsPath: { type: 'string' },
  clusterConfig: { type: 'enum', values: [1,2,4], required: true },
  executionTimes: { type: 'object', },
  speedup: { type: 'object' },
  efficiency: { type: 'object' },
  createdAt: { type: 'string', haveDefault:true}
  completedAt: { type: 'string' }
};

export const JobModel = {
    //create
    async create(data) {
    Validators.validateFields(data, jobSchema);

    //new Job
    const job={};
    job._id = generateObjectId();
    job = Object.assign(job,{...data});

    applyDefaults(job, {
      status: 'pending',
      createdAt: new Date(),
      executionTimes: {},
      speedup: {},
      efficiency: {}
    });
    
    return JobsDB.insert(job);
  },

  //read
  async findById(id) {
    return JobsDB.findOne({ _id: id });
  },

  async findAllByDataset(datasetId) {
    return JobsDB.find({ datasetId });
  },

  async findByStatus(status) {
    Validators.validateFields({ status }, { status: jobSchema.status });
    return JobsDB.find({ status });
  },

  //update
  async updateById(id, updates) {
    Validators.validateFields(updates, jobSchema, { isUpdate: true });
    updates.updatedAt=new Date();
    return JobsDB.update({ _id: id }, { $set: updates }, { returnUpdatedDocs: true });
  },

  //delete
  async deleteById(id) {
    return JobsDB.remove({ _id: id });
  }
};