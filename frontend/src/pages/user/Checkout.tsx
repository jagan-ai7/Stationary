import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { clearCartAsync } from "@/features/cart/cartSlice";
import { createOrder } from "@/features/orders/orderSlice"; // ✅ FIXED
import { pushNotificationAsync } from "@/features/notifications/notificationSlice";

const schema = Yup.object({
  fullName: Yup.string().trim().required("Required"),
  address: Yup.string().trim().required("Required"),
  city: Yup.string().trim().required("Required"),
  zipCode: Yup.string()
    .matches(/^[A-Za-z0-9\s\-]{3,12}$/, "Invalid")
    .required("Required"),
  cardNumber: Yup.string()
    .matches(/^\d{12,19}$/, "Invalid card")
    .required("Required"),
});

export default function Checkout() {
  const items = useAppSelector((s) => s.cart.items);
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const nav = useNavigate();

  const total = useMemo(() => items.reduce((s, i) => s + i.product.price * i.qty, 0), [items]);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Your cart is empty.
      </div>
    );
  }

  return (
    <div className="container mx-auto grid gap-10 px-4 py-12 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Checkout</h1>

        <Formik
          initialValues={{
            fullName: user ? `${user.firstName} ${user.lastName}` : "",
            address: user?.address ?? "",
            city: user?.city ?? "",
            zipCode: user?.zipCode ?? "",
            cardNumber: "",
          }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const orderId = Date.now();

              const orderPayload = {
                id: orderId,
                userId: user?.id ?? 0,
                userName: values.fullName,
                date: new Date().toISOString(),
                status: "pending" as const,
                total,
                items: items.map(({ product, qty }) => ({
                  productId: product.id,
                  name: product.name,
                  qty,
                  price: product.price,
                })),
              };

              // ✅ API CALL (IMPORTANT)
              await dispatch(createOrder(orderPayload)).unwrap();

              // ✅ notifications (persisted to server)
              await dispatch(
                pushNotificationAsync({
                  audience: "user",
                  kind: "order_placed",
                  title: "Order placed",
                  message: `Order #${orderId} was placed successfully.`,
                }),
              ).unwrap();

              await dispatch(
                pushNotificationAsync({
                  audience: "admin",
                  kind: "new_order",
                  title: "New order",
                  message: `Order #${orderId} from ${values.fullName}.`,
                }),
              ).unwrap();

              // ✅ clear cart AFTER success
              dispatch(clearCartAsync());

              toast.success("Order placed!");
              nav("/orders");
            } catch (err) {
              console.error(err);
              toast.error("Failed to place order");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, handleChange, handleBlur, errors, touched, isSubmitting }) => {
            const field = (name: keyof typeof values, label: string) => (
              <div className="space-y-1.5">
                <Label htmlFor={name}>{label}</Label>
                <Input
                  id={name}
                  name={name}
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
              <Form className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">{field("fullName", "Full name")}</div>
                <div className="md:col-span-2">{field("address", "Address")}</div>
                {field("city", "City")}
                {field("zipCode", "Zip code")}
                <div className="md:col-span-2">{field("cardNumber", "Card number")}</div>

                <Button type="submit" size="lg" disabled={isSubmitting} className="md:col-span-2">
                  {isSubmitting ? "Processing..." : `Pay $${total.toFixed(2)}`}
                </Button>
              </Form>
            );
          }}
        </Formik>
      </div>

      {/* ORDER SUMMARY */}
      <aside className="h-fit space-y-3 rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Your order</h2>

        {items.map(({ product, qty }) => (
          <div key={product.id} className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {product.name} × {qty}
            </span>
            <span>${(product.price * qty).toFixed(2)}</span>
          </div>
        ))}

        <div className="flex justify-between border-t pt-3 font-semibold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </aside>
    </div>
  );
}
