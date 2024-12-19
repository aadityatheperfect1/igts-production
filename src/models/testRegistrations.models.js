const mongoose = require('mongoose');
const { Schema } = mongoose;

const testRegistrationSchema = new Schema(
    {
        pid: {
            type: String, // Payment ID
            required: true,
        },
        oid: {
            type: String, // Order ID
            required: true,
        },
        signature: {
            type: String,
            required: true,
        },
        name: {
            type: String, // Name of the person registering for the test
            required: true,
        },
        test: {
            type: String, // Test name or details
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId, // Reference to the User
            ref: 'User', // Add a reference to the User model
            required: true,
        },
        payment: {
            type: mongoose.Schema.Types.ObjectId, // Reference to the Payment
            ref: 'Payment', // Add a reference to the Payment model
            required: true,
        },
        registrationDate: {
            type: Date,
            default: Date.now, // Automatically set the registration date
        },
    },
    {
        timestamps: true, // Automatically manage createdAt and updatedAt fields
    }
);

// Prevent model overwriting
const TestRegistration = mongoose.models.TestRegistration || mongoose.model('TestRegistration', testRegistrationSchema);

export default TestRegistration;