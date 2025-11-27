import { ProductInfo } from "@/models/interfaces/products.interfaces"
import { PlusIcon } from "@heroicons/react/outline"
import { Dispatch, SetStateAction } from "react"

type AddProductImagesProp = {
  product: ProductInfo
  setProduct: Dispatch<SetStateAction<ProductInfo>>
}
export default function AddProductImages({
  product,
  setProduct,
}: AddProductImagesProp) {
  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0]
    if (file) {
      const fileUrl = URL.createObjectURL(file)
      const images = [...product.images, fileUrl]
      const imagesFile = product.imagesFile
        ? [...product.imagesFile, file]
        : [file]
      setProduct({ ...product, images, imagesFile: imagesFile })
    }
  }
  return (
    <div className="product-img-list flex flex-row gap-2.5 flex-wrap">
      {product &&
        product.images.map((items, key) => {
          return (
            <div
              key={key}
              className="block w-[100px] h-[100px] border border-dashed rounded-xl border-slate-200 bg-slate-100"
            >
              <img src={items} alt={`${product.name}_${items}`} />
            </div>
          )
        })}
      <div className="block w-[100px] h-[100px] border border-dashed rounded-xl border-slate-200 bg-slate-100">
        <input
          id="addProduct_images"
          type="file"
          name="product_images"
          className="hidden"
          placeholder=""
          onChange={handleAddImages}
        />
        <label
          htmlFor="addProduct_images"
          className="w-full h-full relative flex justify-center align-middle hover:bg-slate-200 cursor-pointer"
        >
          <PlusIcon width="50" height="50" className="h-full" />
        </label>
      </div>
    </div>
  )
}
