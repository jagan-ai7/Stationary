import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserThunk } from "@/features/users/userSlice";
import { profileSchema } from "@/utils/validation";
import { Form, Formik } from "formik";
import { toast } from "sonner";

export default function Profile() {
  const user = useAppSelector((s) => s.auth.user);
  console.log("User:", user?.role);
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.profileStatus);

  console.log("Status:", status);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Profile</h1>
      <div className="rounded-xl border bg-card p-6">
        <Formik
          initialValues={{
            firstName: user?.firstName ?? "",
            lastName: user?.lastName ?? "",
            email: user?.email ?? "",
            phoneNumber: user?.phoneNumber ?? "",
            address: user?.address ?? "",
            country: user?.country ?? "",
            state: user?.state ?? "",
            city: user?.city ?? "",
            zipCode: user?.zipCode ?? "",
          }}
          validationSchema={profileSchema}
          onSubmit={async (values) => {
            const res = await dispatch(updateUserThunk({ data: values }));
            if (updateUserThunk.fulfilled.match(res)) {
              toast.success("Profile updated");
            }
          }}
        >
          {({ values, handleChange, handleBlur, errors, touched }) => {
            const field = (name: keyof typeof values, label: string, type = "text") => (
              <div className="space-y-1.5">
                <Label htmlFor={name}>{label}</Label>
                <Input
                  id={name}
                  name={name}
                  type={type}
                  value={values[name]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
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
                {user?.role === "admin" ? (
                  ""
                ) : (
                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full" disabled={status === "loading"}>
                      {status === "loading" ? "Updating profile…" : "Update Profile"}
                    </Button>
                  </div>
                )}
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}
