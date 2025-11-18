import * as yup from "yup";

export const RegisterValidation = () =>
  yup.object().shape({
    name: yup.string().required("This Field is Required"),
    email: yup
      .string()
      .email("Enter a valid email")
      .required("This Field is Required"),
    password: yup
      .string()
      .min(6, "Minimum 6 characters")
      .required("This Field is Required"),
  });

  
export const LoginValidation = () =>
  yup.object().shape({
    email: yup
      .string()
      .email("Enter a valid email")
      .required("This Field is Required"),
    password: yup
      .string()
      .min(6, "Minimum 6 characters")
      .required("This Field is Required"),
  });
