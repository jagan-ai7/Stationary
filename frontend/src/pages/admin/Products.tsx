import { useState, useRef, useEffect } from "react";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  createProduct,
  editProduct,
  fetchProducts,
  removeProduct,
} from "@/features/products/productSlice";
import { productSchema } from "@/utils/validation";
import { type Product } from "@/features/products/productSlice";
import { getImageUrl } from "@/utils/imageHelper";
import { fetchNotifications } from "@/features/notifications/notificationSlice";

/* ---------------- Image Picker ---------------- */

function ImagePicker({
  initialUrl,
  onChange,
}: {
  initialUrl?: string;
  onChange: (file: File | null, previewUrl: string | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setPreview(initialUrl ?? null);
  }, [initialUrl]);

  // ✅ cleanup blob URLs
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFile = (file?: File) => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(file, url);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div
        onClick={() => inputRef.current?.click()}
        className="w-full h-30 rounded border border-dashed flex items-center justify-center cursor-pointer overflow-hidden bg-muted relative"
      >
        {preview ? (
          <img src={preview} className="h-30 w-full object-contain" />
        ) : (
          <span className="text-sm text-muted-foreground">Choose image</span>
        )}

        {preview && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreview(null);
              onChange(null, null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute top-1 right-1 h-6 w-6 bg-red-600 text-white rounded-full"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Main Component ---------------- */

export default function AdminProducts() {
  const products = useAppSelector((s) => s.products.items);
  const dispatch = useAppDispatch();

  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const openNew = () => {
    setEditing(null);
    setFile(null);
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setFile(null);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" />
              New product
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle>
            </DialogHeader>

            <Formik
              initialValues={{
                name: editing?.name ?? "",
                category: editing?.category ?? "",
                price: editing?.price ?? 0,
                stock: editing?.stock ?? 0,
                description: editing?.description ?? "",
                image: editing?.image ?? "",
              }}
              validationSchema={productSchema}
              enableReinitialize
              onSubmit={async (values) => {
                try {
                  if (editing) {
                    await dispatch(
                      editProduct({
                        product: { ...editing, ...values },
                        file: file ?? undefined,
                      }),
                    ).unwrap();
                    await dispatch(fetchNotifications()); // 🔔 refresh notifications after edit
                    toast.success("Product updated");
                  } else {
                    await dispatch(
                      createProduct({
                        product: values,
                        file: file ?? undefined,
                      }),
                    ).unwrap();
                    toast.success("Product created");
                  }
                  setOpen(false);
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              {({ values, handleChange, handleBlur, errors, touched, setFieldValue }) => {
                // ✅ FIXED image URL logic
                const imageUrl = values.image?.startsWith("blob:")
                  ? values.image
                  : editing && values.image
                    ? getImageUrl(values.image)
                    : values.image;

                return (
                  <Form className="space-y-3">
                    {/* name + category */}
                    {(["name", "category"] as const).map((f) => (
                      <div key={f}>
                        <Label>{f}</Label>
                        <Input
                          name={f}
                          value={values[f]}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        {touched[f] && errors[f] && (
                          <p className="text-xs text-destructive">{errors[f]}</p>
                        )}
                      </div>
                    ))}

                    {/* image */}
                    <div>
                      <Label>Image</Label>
                      <ImagePicker
                        initialUrl={imageUrl}
                        onChange={(file, preview) => {
                          setFile(file);
                          setFieldValue("image", preview || "");
                        }}
                      />
                    </div>

                    {/* price + stock */}
                    <div className="grid grid-cols-2 gap-3">
                      {(["price", "stock"] as const).map((f) => (
                        <div key={f}>
                          <Label>{f}</Label>
                          <Input
                            type="number"
                            name={f}
                            value={values[f]}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                      ))}
                    </div>

                    {/* description */}
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        name="description"
                        rows={3}
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      {editing ? "Save" : "Create"}
                    </Button>
                  </Form>
                );
              }}
            </Formik>
          </DialogContent>
        </Dialog>
      </div>

      {/* table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="px-4 py-3 flex items-center gap-3">
                  <img src={getImageUrl(p.image)} className="h-10 w-10 rounded object-cover" />
                  {p.name}
                </td>

                <td className="px-4 py-3">{p.category}</td>
                <td className="px-4 py-3">${p.price}</td>
                <td className="px-4 py-3">{p.stock === 0 ? "Out" : p.stock}</td>

                <td className="px-4 py-3 text-right space-x-2">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      dispatch(removeProduct(p.id));
                      toast.success("Deleted");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
