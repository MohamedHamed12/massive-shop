import { object, string, number, date, InferType } from "yup";
import User from "./user.model";

const checkEmailUnique = async (email: string) => {
  const user = await User.findOne({ email: email });
  if (!user) return true;
  else return false;
};

export const userSchema = object({
  firstname: string().required().min(2),
  lastname: string().required().min(2),
  email: string()
    .required("Email is required")
    .email("The email is not valid")
    .test(
      "unique-email",
      "email is exist! try another one",
      async (value: string) => {
        if (!value) return true;
        const isUnique = await checkEmailUnique(value);
        return isUnique;
      }
    ),
  password: string().required().min(6),
  confirmPassword: string()
    .required()
    .min(6)
    .test(
      "passwords-match",
      "passwords are not matched",
      function (value: string) {
        if (!value) return true;
        return value === this.parent.password;
      }
    ),
});