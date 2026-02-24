const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ProspectSchema = new mongoose.Schema({
    _id: { type: String, default: () => uuidv4() },
    ref_no: { type: String, unique: true },
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, default: '', trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, default: '', trim: true },
    address: { type: String, default: '' },
    city: { type: String, default: '', trim: true },
    taluka: { type: String, default: '', trim: true },
    source: { type: String, default: '' },
    model: { type: String, default: '' },
    vehicle_type: { type: String, default: '' },
    budget: { type: String, default: '' },
    status: {
        type: String,
        default: 'New',
        enum: ['New', 'Contacted', 'Follow Up', 'Qualified', 'Converted', 'Delivered', 'Lost']
    },
    salesperson_id: { type: String, default: '', ref: 'User' },
    delivery_date: { type: String, default: '' },
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

// Auto-generate ref_no before save
ProspectSchema.pre('save', async function () {
    if (!this.ref_no) {
        const count = await mongoose.model('Prospect').countDocuments();
        this.ref_no = `PRO-${String(count + 1).padStart(4, '0')}`;
    }
});

// Index for common queries
ProspectSchema.index({ status: 1 });
ProspectSchema.index({ taluka: 1 });
ProspectSchema.index({ salesperson_id: 1 });
ProspectSchema.index({ created_at: -1 });

module.exports = mongoose.models.Prospect || mongoose.model('Prospect', ProspectSchema);
