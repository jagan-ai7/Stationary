import { Link, useLocation, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/utils/validation";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { login } from "@/features/auth/authSlice";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const loc = useLocation();
  const status = useAppSelector((s) => s.auth.status);
  const from = (loc.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <Link to="/" className="text-xl font-semibold tracking-tight">
            Inkwell
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={async (values) => {
            const res = await dispatch(login(values));
            if (login.fulfilled.match(res)) {
              toast.success("Signed in");
              nav(res.payload.user.role === "admin" ? "/admin" : from, { replace: true });
            }
          }}
        >
          {({ values, handleChange, handleBlur, errors, touched }) => (
            <Form className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.email && errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.password && errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={status === "loading"}>
                {status === "loading" ? "Signing in…" : "Sign in"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Tip: use an email containing "admin" to access the admin portal.
              </p>
              <p className="text-center text-sm text-muted-foreground">
                No account?{" "}
                <Link to="/signup" className="font-medium text-foreground hover:underline">
                  Create one
                </Link>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
