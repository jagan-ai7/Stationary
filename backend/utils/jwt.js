import jwt from "jsonwebtoken";
const secret = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRES;

const generateToken = (payload) => {
  return jwt.sign(payload, secret, { expiresIn });
};

export default generateToken;
