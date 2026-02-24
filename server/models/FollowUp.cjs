const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const FollowUpSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuidv4() },
    prospect_id: { type: String, required: true, ref: 'Prospect' },
    follow_up_type: { type: String, required: true },
    follow_up_date: { type: String, required: true },
    follow_up_time: { type: String, default: '' },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Completed', 'Overdue', 'Cancelled'] },
    outcome: { type: String, default: '' },
    next_follow_up_date: { type: String, default: '' },
    remarks: { type: String, default: '' },
    created_by: { type: String, default: '', ref: 'User' },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret.__v;
            return ret;
        }
    },
    toObject: { virtuals: true }
});

FollowUpSchema.index({ prospect_id: 1 });
FollowUpSchema.index({ follow_up_date: 1, status: 1 });

module.exports = mongoose.models.FollowUp || mongoose.model('FollowUp', FollowUpSchema);
