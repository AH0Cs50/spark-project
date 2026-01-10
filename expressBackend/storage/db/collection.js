
import Datastore from 'nedb-promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a "users" collection stored in users.db
export const UsersDB = Datastore.create({
  filename: path.join(__dirname, 'users.db'), 
  autoload: true // load existing data
});

// Create a "datasets" collection stored in users.db
export const DatasetsDB = Datastore.create({
  filename: path.join(__dirname, 'dataset.db'), 
  autoload: true // load existing data
});

// Create a "job" collection stored in users.db
export const JobsDB = Datastore.create({
  filename: path.join(__dirname, 'job.db'), 
  autoload: true // load existing data
});

// Create a "descriptive" collection stored in users.db
export const DescriptivesDB = Datastore.create({
  filename: path.join(__dirname, 'descriptive.db'), 
  autoload: true // load existing data
});

// Create a "datasets" collection stored in users.db
export const MlsDB = Datastore.create({
  filename: path.join(__dirname, 'ml.db'), 
  autoload: true // load existing data
});
