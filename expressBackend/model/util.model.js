//utils/modelUtils.js
import crypto from 'crypto';

class vlidationError extends Error {
  constructor(message,details=null){
    super();
    super.name='ValidationError';
    super.message=message,
    this.details=details;
  }
}


/* =========================
   ID Generation
========================= */

export function generateObjectId() {
  return crypto.randomBytes(12).toString('hex');
}

/* =========================
   Generic Validators
========================= */

export function formatDate(date) {
  // Ensure the input is a valid Date object
  if (!(date instanceof Date) || isNaN(date)) {
    const error =new Error("invalid date type");
    throw error;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 because months are 0-11
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function validateString(value, fieldName, { required = true, nonEmpty = true } = {}) {
  if (required && typeof value !== 'string') {
    throw new vlidationError(`${fieldName} must be a string`);
  }
  if (nonEmpty && value && value.trim() === '') {
    throw new vlidationError(`${fieldName} cannot be empty`);
  }
}

export function validateEnum(value, allowedValues, fieldName) {
  if (value !== undefined && !allowedValues.includes(value)) {
    throw new vlidationError(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
  }
}

export function validateNumber(value, fieldName, { positive = true } = {}) {
  if (typeof value !== 'number') {
    throw new vlidationError(`${fieldName} must be a number`);
  }
  if (positive && value <= 0) {
    throw new vlidationError(`${fieldName} must be positive`);
  }
}

export function validateObject(value, fieldName, { required = false } = {}) {
  if (required && (typeof value !== 'object' || value === null || Array.isArray(value))) {
    throw new vlidationError(`${fieldName} must be a object`);
  }
}

export function validateArray(value, fieldName, { required = false, elementType } = {}) {
  if (required && !Array.isArray(value)) {
    throw new vlidationError(`${fieldName} must be a array`);
  }
  if (Array.isArray(value) && elementType) {
    value.forEach((el, idx) => {
      if (typeof el !== elementType) {
        throw new vlidationError(`${fieldName}[${idx}] must be a ${elementType}`);
      }
    });
  }
}

/* =========================
   Generic defaults
========================= */

export function applyDefaults(obj, defaults = {}, isNew = true) {
  if (!isNew || typeof obj !== 'object' || obj === null) return obj;

  Object.keys(defaults).forEach(key => {
    if (obj[key] === undefined) {
      obj[key] = defaults[key]; // just assign the default value
    }
});

  return obj;
}


/* =========================
   Generic field validator
========================= */

/**
 * Validate an object based on a schema descriptor
 * Example descriptor:
 * {
 *   userId: { type: 'string', required: true },
 *   fileType: { type: 'enum', values: ['csv','pdf'], required: true },
 *   fileSize: { type: 'number', positive: true }
 * }
 */
export function validateFields(obj, schema, { isUpdate = false } = {}) {
  const errors = [];

  for (const field in schema) {
    const rules = schema[field];
    const value = obj[field];

    //skip validation if field has default and is missing
    if (value === undefined && (rules.haveDefault || rules.skip)) {
      continue;
    }

    // existing update logic
    if (!isUpdate || value !== undefined) {
      try {
        switch (rules.type) {
          case 'string':
            validateString(value, field, rules);
            break;
          case 'number':
            validateNumber(value, field, rules);
            break;
          case 'enum':
            validateEnum(value, rules.values, field);
            break;
          case 'object':
            validateObject(value, field, rules);
            break;
          case 'array':
            validateArray(value, field, rules);
            break;
          default:
            throw new vlidationError(`Unknown type ${rules.type} for field ${field}`);
        }
      } catch (e) {
        errors.push(e.message);
      }
    }
  }

  if (errors.length) {
    const err = new vlidationError('Validation failed');
    err.details = errors;
    throw err;
  }
}
/* =========================
   Export as single object
========================= */

export const Validators = {
  validateString,
  validateEnum,
  validateNumber,
  validateObject,
  validateArray,
  validateFields
};