const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuidv4() },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, default: 'salesperson', enum: ['admin', 'salesperson', 'manager'] },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret.__v;
            delete ret.password;
            return ret;
        }
    },
    toObject: { virtuals: true }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
