export type LoginFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
  fields?: {
    email?: string;
  };
};

export const initialLoginFormState: LoginFormState = {
  status: "idle",
};
