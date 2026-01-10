const descriptiveSchema = {
    statistics: {
        type: 'array',
        allowedValues: ['rowCount', 'columnCount', 'missingValues', 'minMaxMean'],
        required: true
    },
    columns: { type: 'array', required: false }
};

const mlSchemas = {
    kmeans: {
        algorithm: { type: 'string', allowedValues: ['kmeans'], required: true },
        features: { type: 'array', required: true },
        k: { type: 'number', required: true },
        maxIter: { type: 'number', required: false, default: 20 }
    },
    linear_regression: {
        algorithm: { type: 'string', allowedValues: ['linear_regression'], required: true },
        label: { type: 'string', required: true },
        features: { type: 'array', required: true },
        trainRatio: { type: 'number', required: false, default: 0.8 }
    },
    fp_growth: {
        algorithm: { type: 'string', allowedValues: ['fp_growth'], required: true },
        itemsColumn: { type: 'string', required: true },
        minSupport: { type: 'number', required: false, default: 0.02 }
    }
};

class ApiError extends Error {
    constructor(code, message) {
        super(message);
        super.name = 'parameter validation';
        this.code = code;
    }
}

const validateJobParametersObject = (jobType, subType, parameters) => {

    if (jobType === 'descriptive') {
        // Check required statistics field
        if (!parameters.statistics || !Array.isArray(parameters.statistics)) {
            throw new ApiError(400, 'Descriptive job must include a statistics array');
        }

        const invalidStats = parameters.statistics.filter(
            s => !descriptiveSchema.statistics.allowedValues.includes(s)
        );

        if (invalidStats.length) {
            throw new ApiError(400, `Invalid statistics: ${invalidStats.join(', ')}`);
        }

        // Check columns field
        if (parameters.columns && !Array.isArray(parameters.columns)) {
            throw new ApiError(400, 'columns must be an array');
        }

        return true;
    }

    if (jobType === 'ml') {
        if (!subType || !mlSchemas[subType]) {
            throw new ApiError(
                400,
                `Unsupported ML algorithm. Allowed: ${Object.keys(mlSchemas).join(', ')}`
            );
        }

        const schema = mlSchemas[subType];

        // Check each required field
        for (const [key, rules] of Object.entries(schema)) {
            const value = parameters[key];

            if (rules.required && (value === undefined || value === null)) {
                throw new ApiError(400, `Missing required field: ${key}`);
            }

            if (value !== undefined) {
                // Type checks
                if (rules.type === 'array' && !Array.isArray(value)) {
                    throw new ApiError(400, `${key} must be an array`);
                }
                if (rules.type === 'string' && typeof value !== 'string') {
                    throw new ApiError(400, `${key} must be a string`);
                }
                if (rules.type === 'number' && typeof value !== 'number') {
                    throw new ApiError(400, `${key} must be a number`);
                }

                // Allowed values check
                if (rules.allowedValues && !rules.allowedValues.includes(value)) {
                    throw new ApiError(400, `${key} value must be one of: ${rules.allowedValues.join(', ')}`);
                }
            }
        }

        return true;
    }

    throw new ApiError(400, 'Invalid job type');
};


const jobService ={}

export default jobService;
