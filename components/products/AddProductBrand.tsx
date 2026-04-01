import { ProductInfo } from "@/models/interfaces/products.interfaces"
import TextInput from "../form/inputText"
import { Dispatch, SetStateAction } from "react"

type AddProductProps = {
  product: ProductInfo
  setProduct: Dispatch<SetStateAction<ProductInfo>>
}

export default function AddProductBrand({
  product,
  setProduct,
}: AddProductProps) {
  const handleInputBrand = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name == "brand_name") {
      setProduct({
        ...product,
        brand: { ...product.brand, name: e.target.value },
      })
    } else {
      const file = e.target.files[0]
      if (file) {
        const fileUrl = URL.createObjectURL(file)
        setProduct({
          ...product,
          brand: { ...product.brand, logoUrl: fileUrl, logoFile: file },
        })
        console.log("product", product)
      }
    }
  }

  const fetchProductImage = (imageUrl: string) => {
    if (!imageUrl) {
      return "file.svg"
    }

    if (imageUrl.startsWith("/https") || imageUrl.startsWith("/http")) {
      return imageUrl.substring(1, imageUrl.length)
    }

    return imageUrl
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="brand-field grow">
        <label htmlFor="brand_name" className="block text-sm font-medium">
          Brand Name
        </label>
        <TextInput
          id="brand_name"
          value={product?.brand?.name ?? ""}
          onChange={handleInputBrand}
        />
      </div>
      <div className="brand-images w-full">
        <label
          htmlFor="brand_image"
          className="flex flex-col gap-2 justify-center align-middle p-2 cursor-pointer hover:bg-slate-100 rounded-lg"
        >
          <div className="font-bold">Image Preview</div>
          <input
            type="file"
            id="brand_image"
            accept="image/*"
            onChange={handleInputBrand}
            className="w-0 h-0"
          />
          {product?.brand?.logoUrl ? (
            <img
              src={fetchProductImage(product?.brand?.logoUrl)}
              alt="logo-preview"
              className="w-full h-50 rounded-lg object-contain"
            />
          ) : (
            <div id="img-placeholder-text ">Click or Drag Image Here</div>
          )}
        </label>
      </div>
    </div>
  )
}
