// models/user.model.js
import { UsersDB } from '../storage/db/collection.js';
import { generateObjectId, applyDefaults, Validators,formatDate } from './util.model.js';

const userSchema = {
  name: { type: 'string', required: true },
  email: { type: 'string', required: true, nonEmpty: true },
  passwordHash: { type: 'string', required: true, nonEmpty: true },
  createdAt: { type: 'string', haveDefault:true},
  updatedAt: { type: 'string', haveDefault:true }
};

const emailRegex = /\S+@\S+\.\S+/;

function emailValidation(email){
  if(!emailRegex.test(email))
    throw Error("Email struture not valid").name='ValidationError';
}

const UserModel = {
  //create
  async create(data) {
    Validators.validateFields(data, userSchema);
    emailValidation(data.email);
    //new user
    let user={};
    user._id = generateObjectId();
    user=Object.assign(user,{...data});

    applyDefaults(user, { createdAt: new Date(), updatedAt: new Date() });
    return UsersDB.insert(user);
  },

  //read
  async findById(id) {
    return UsersDB.findOne({ _id: id });
  },
  async findByEmail(email) {
    
    return UsersDB.findOne({ email });
  },

  //update
  async updateById(id, updates) {
    Validators.validateFields(updates, userSchema, { isUpdate: true });
    if(updates.email)emailValidation(updates.email);
    updates.createdAt=new Date();
    return UsersDB.update({ _id: id }, { $set: updates }, { returnUpdatedDocs: true });
  },

  //delete
  async deleteById(id) {
    return UsersDB.remove({ _id: id });
  }
};

export default UserModel;