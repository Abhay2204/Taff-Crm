const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ServiceSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuidv4() },
    prospect_id: { type: String, required: true, ref: 'Prospect' },
    vehicle_model: { type: String, default: '' },
    customer_name: { type: String, required: true },
    customer_mobile: { type: String, default: '' },
    taluka: { type: String, default: '' },
    delivery_date: { type: String, required: true },
    service_month: { type: String, required: true, enum: ['1st Month', '4th Month', '7th Month', '12th Month'] },
    service_date: { type: String, required: true },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Completed', 'Cancelled'] },
    remarks: { type: String, default: '' },
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

ServiceSchema.index({ service_date: 1, status: 1 });
ServiceSchema.index({ prospect_id: 1 });
ServiceSchema.index({ taluka: 1 });

module.exports = mongoose.models.Service || mongoose.model('Service', ServiceSchema);
