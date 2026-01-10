// models/dataset.model.js
import { DatasetsDB } from '../storage/db/collection.js';
import { generateObjectId, applyDefaults, Validators } from './util.model.js';

const datasetSchema = {
  userId: { type: 'string', required: true },
  fileName: { type: 'string', required: true },
  fileType: { type: 'enum', values: ['pdf','csv','txt','json'], required: true },
  fileSize: { type: 'number', positive: true },
  storagePath: { type: 'string', required: true },
  uploadDate: { type: 'string', haveDefault:true },
  status: { type: 'enum', values: ['uploaded','failed'] }
};

const DatasetModel = {

  async create(data) {
    Validators.validateFields(data, datasetSchema);
    
    //new dataset
    let dataset={};
    dataset._id = generateObjectId();
    dataset = Object.assign(dataset,{...data});

    applyDefaults(dataset, { fileType: 'csv', status: 'uploaded', uploadDate: new Date() });

    return await DatasetsDB.insert(dataset);
  },

  async findById(id) {
    return await DatasetsDB.findOne({ _id: id });
  },

  async findByUserId(userId) {
    return await DatasetsDB.find({ userId });
  },

  async updateById(id, updates) {
    Validators.validateFields(updates, datasetSchema, { isUpdate: true });
    return await DatasetsDB.update({ _id: id }, { $set: updates }, { returnUpdatedDocs: true });
  },

  async deleteById(id) {
    return await DatasetsDB.remove({ _id: id });
  }
};

export default DatasetModel;