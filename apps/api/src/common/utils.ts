import mongoose from 'mongoose';

export const normalizeValueForDiff = (value: unknown) => {
    if (value instanceof Date) {
        return value.toISOString();
    }

    if (typeof value === 'string' ||
        value instanceof mongoose.Types.ObjectId) {
        return value.toString();
    }

    if (mongoose.isValidObjectId(value)) {
        return String(value);
    }

    return value;
};
