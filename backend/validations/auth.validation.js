import Joi from "joi";

export const signupSchema = Joi.object({
  firstName: Joi.string().min(3).trim().required().messages({
    "string.empty": "First name is required",
    "string.min": "First name must be at least 3 characters",
  }),

  lastName: Joi.string().min(3).trim().required().messages({
    "string.empty": "Last name is required",
    "string.min": "Last name must be at least 3 characters",
  }),

  email: Joi.string().email().lowercase().trim().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
  }),

  phoneNumber: Joi.string()
    .pattern(/^\+?[0-9]+$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must contain only digits",
      "string.empty": "Phone number is required",
    }),
  address: Joi.string().min(3).trim().required(),

  country: Joi.string().min(2).trim().required(),

  state: Joi.string().min(2).trim().required(),

  city: Joi.string().min(2).trim().required(),

  zipCode: Joi.string()
    .pattern(/^[0-9]{5,6}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid zip code",
    }),

  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one letter and one number",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
  }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});
