import * as Yup from "yup";

export const loginSchema = Yup.object({
  email: Yup.string().trim().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Min 6 characters").required("Password is required"),
});

const passwordRule = Yup.string()
  .min(8, "Min 8 characters")
  .matches(/[A-Z]/, "Must include an uppercase letter")
  .matches(/[a-z]/, "Must include a lowercase letter")
  .matches(/[0-9]/, "Must include a number")
  .required("Password is required");

export const signupSchema = Yup.object({
  firstName: Yup.string().trim().min(2, "Too short").max(50).required("Required"),
  lastName: Yup.string().trim().min(2, "Too short").max(50).required("Required"),
  email: Yup.string().trim().email("Invalid email").required("Required"),
  phoneNumber: Yup.string()
    .matches(/^[0-9+\-\s()]{7,20}$/, "Invalid phone number")
    .required("Required"),
  address: Yup.string().trim().min(4).max(200).required("Required"),
  country: Yup.string().trim().min(2).max(60).required("Required"),
  state: Yup.string().trim().min(2).max(60).required("Required"),
  city: Yup.string().trim().min(2).max(60).required("Required"),
  zipCode: Yup.string()
    .matches(/^[A-Za-z0-9\s\-]{3,12}$/, "Invalid zip")
    .required("Required"),
  password: passwordRule,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Required"),
});

export const productSchema = Yup.object({
  name: Yup.string().trim().min(2).max(120).required("Required"),
  category: Yup.string().trim().min(2).max(60).required("Required"),
  price: Yup.number().positive("Must be > 0").required("Required"),
  stock: Yup.number().integer().min(0, "Cannot be negative").required("Required"),
  description: Yup.string().trim().min(8).max(1000).required("Required"),
  image: Yup.string().trim(),
});

export const profileSchema = Yup.object({
  firstName: Yup.string().trim().min(2, "Too short").max(50).required("Required"),
  lastName: Yup.string().trim().min(2, "Too short").max(50).required("Required"),
  email: Yup.string().trim().email("Invalid email").required("Required"),
  phoneNumber: Yup.string()
    .matches(/^[0-9+\-\s()]{7,20}$/, "Invalid phone number")
    .required("Required"),
  address: Yup.string().trim().min(4).max(200).required("Required"),
  country: Yup.string().trim().min(2).max(60).required("Required"),
  state: Yup.string().trim().min(2).max(60).required("Required"),
  city: Yup.string().trim().min(2).max(60).required("Required"),
  zipCode: Yup.string()
    .matches(/^[A-Za-z0-9\s\-]{3,12}$/, "Invalid zip")
    .required("Required"),
});
