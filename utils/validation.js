
// Function to validate if a value is numeric
const validateNumeric = (value) => {
    // Check if the accountId format is valid (only digits) and if it is not NaN
    return /^\d+$/.test(value) && !isNaN(parseInt(value));
};

// Function to validate if a value contains only alphabetic characters
const validateAlphabetic = (value) => {
    // Check if the value contains only alphabetic characters (including spaces)
    return /^[\sa-zA-Z]+$/.test(value);
};

// Function to validate if a value is a boolean
const validateBoolean = (value) => {
    // Check if the value is of boolean type
    return typeof value === 'boolean';
};

// Function to ensure no unexpected query parameters are present
const validateNoQueryParams = (query) => {
    // Check if there are any query parameters present
    return Object.keys(query).length === 0;
};


function validateEmail(email) {
    // Regular expression to validate the email format
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validateDate(dateString) {
    // Regular expression to validate ISO 8601 format date
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    return regex.test(dateString);
}

function validatePhone(phoneNumber) {
    // Regular expression for validating phone number format
    const phoneNumberRegex = /^\+\d{2}\d{9}$/;
    
    // Return true if the phone number matches the regex, otherwise false
    return phoneNumberRegex.test(phoneNumber);
}

module.exports = {
    validateNumeric,
    validateAlphabetic,
    validateBoolean,
    validateNoQueryParams,
    validateEmail,
    validateDate,
    validatePhone
}