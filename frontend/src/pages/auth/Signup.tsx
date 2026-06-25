import { Link, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordInput from "@/components/common/PasswordInput";
import { signupSchema } from "@/utils/validation";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { signup } from "@/features/auth/authSlice";

export default function SignupPage() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const status = useAppSelector((s) => s.auth.status);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-2xl rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <Link to="/" className="text-xl font-semibold tracking-tight">
            Inkwell
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">Create your account</h1>
        </div>
        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            address: "",
            country: "",
            state: "",
            city: "",
            zipCode: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={signupSchema}
          onSubmit={async (values) => {
            const { confirmPassword, ...rest } = values;
            const res = await dispatch(signup(rest));
            if (signup.fulfilled.match(res)) {
              toast.success("Account created");
              nav("/", { replace: true });
            }
          }}
        >
          {({ values, handleChange, handleBlur, errors, touched }) => {
            const field = (name: keyof typeof values, label: string, type = "text") => (
              <div className="space-y-1.5">
                <Label htmlFor={name}>{label}</Label>
                {type === "password" ? (
                  <PasswordInput
                    id={name}
                    name={name}
                    value={values[name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                ) : (
                  <Input
                    id={name}
                    name={name}
                    type={type}
                    value={values[name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                )}
                {touched[name] && errors[name] && (
                  <p className="text-xs text-destructive">{errors[name] as string}</p>
                )}
              </div>
            );
            return (
              <Form className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {field("firstName", "First name")}
                {field("lastName", "Last name")}
                {field("email", "Email", "email")}
                {field("phoneNumber", "Phone number")}
                <div className="md:col-span-2">{field("address", "Address")}</div>
                {field("country", "Country")}
                {field("state", "State")}
                {field("city", "City")}
                {field("zipCode", "Zip code")}
                {field("password", "Password", "password")}
                {field("confirmPassword", "Confirm password", "password")}
                <div className="md:col-span-2">
                  <Button type="submit" className="w-full" disabled={status === "loading"}>
                    {status === "loading" ? "Creating account…" : "Create account"}
                  </Button>
                </div>
                <p className="md:col-span-2 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="font-medium text-foreground hover:underline">
                    Sign in
                  </Link>
                </p>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}
