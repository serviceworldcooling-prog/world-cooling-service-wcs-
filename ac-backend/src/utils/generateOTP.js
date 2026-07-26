// Generates a 4-digit numeric OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

module.exports = generateOTP;
