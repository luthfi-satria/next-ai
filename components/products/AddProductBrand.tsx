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
      }
    }
  }

  return (
    <div className="flex flex-row gap-4">
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
      <div className="brand-images w-1/3">
        <label
          htmlFor="brand_image"
          className="flex flex-row gap-2 justify-center align-middle p-2 cursor-pointer hover:bg-slate-100 rounded-lg"
        >
          <input
            type="file"
            id="brand_image"
            accept="image/*"
            onChange={handleInputBrand}
            className="w-0"
          />
          <img
            src={`${product?.brand?.logoUrl || "/file.svg"}`}
            alt="logo-preview"
            className="w-[50px] h-[50px] rounded-lg"
          />
          <div id="img-placeholder-text">Click or Drag Image Here</div>
        </label>
      </div>
    </div>
  )
}
