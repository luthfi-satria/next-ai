import {
  initVariantAttributes,
  ProductVariants,
} from "@/models/interfaces/products.interfaces"
import TextInput from "../form/inputText"
import { ChangeEvent, Dispatch, SetStateAction } from "react"
import { PlusIcon, TrashIcon } from "@heroicons/react/outline"
import Button from "../form/inputButton"
import CurrencyInput from "../form/inputCurrency"
import NumberInput from "../form/inputNumber"
import { ChangeEventOrValues } from "../form/inputGenerator"

type AddVariantsProps = {
  variants: ProductVariants
  setVariants: Dispatch<SetStateAction<ProductVariants>>
  handleOnSave: () => void
}

export default function AddProductVariantsAttributes({
  variants,
  setVariants,
  handleOnSave,
}: AddVariantsProps) {
  const handleInputVariantImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0]
    if (file) {
      const fileUrl = URL.createObjectURL(file)
      const newImagesFile = variants.imagesFile
        ? [...variants.imagesFile]
        : [file]
      setVariants({
        ...variants,
        images: [...variants.images, fileUrl],
        imagesFile: newImagesFile,
      })
    }
  }

  const handleAddNewAttributes = () => {
    const newAttributes = [...variants.attributes, initVariantAttributes]
    setVariants({ ...variants, attributes: newAttributes })
  }

  const handleRemoveAttributes = (keyToRemove: number) => {
    const updatedAttributes = variants.attributes.filter(
      (_, index) => index !== keyToRemove,
    )
    setVariants({ ...variants, attributes: updatedAttributes })
  }

  const handleInputAttributes = (
    keyToUpdate: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target

    const updatedAttributes = variants.attributes.map((attribute, index) => {
      if (index === keyToUpdate) {
        return {
          ...attribute,
          [name]: value,
        }
      }
      return attribute
    })

    setVariants({ ...variants, attributes: updatedAttributes })
  }
  const handleInputVariantProp = (e: ChangeEventOrValues) => {
    // Handle both ChangeEvent and object format { name, value }
    let name: string
    let value: string | number

    if ("target" in e) {
      // It's a ChangeEvent - need to check if target has name and value properties
      const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      name = target.name
      value = target.value
    } else {
      // It's an object { name, value }
      name = e.name
      // Convert boolean to string if needed, or keep as number/string
      value = typeof e.value === "boolean" ? String(e.value) : e.value
    }

    // Convert number to string for price and stockQty fields (ProductVariants expects strings)
    if (name === "price" || name === "stockQty") {
      value = typeof value === "number" ? String(value) : value
    }

    setVariants({ ...variants, [name]: value })
  }
  const handleSaveNewVariant = () => {
    handleOnSave()
  }
  return (
    <div className="variants-modal-content flex flex-col gap-4 p-4">
      <div className="variants-list flex flex-col gap-6">
        <div className="flex flex-col gap-2 rounded-lg">
          <TextInput
            label="sku"
            id="variant-sku"
            name="sku"
            value={variants.sku}
            onChange={handleInputVariantProp}
          />
          <div className="flex flex-row gap-4">
            <CurrencyInput
              label="price"
              id="variant-price"
              name="price"
              value={variants.price}
              onChange={handleInputVariantProp}
            />
            <NumberInput
              label="stock"
              id="variant_stock"
              name="stockQty"
              value={variants.stockQty}
              className="w-1/2"
              onChange={handleInputVariantProp}
            />
          </div>
          <div className="block">
            <div className="variants-image">
              <input
                type="file"
                id="variant-img"
                accept="image/*"
                onChange={handleInputVariantImg}
                className="w-0"
              />
              <label
                htmlFor="variant-img"
                className="flex flex-row gap-2 justify-start p-8 cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-100 rounded-lg"
              >
                <img
                  src={variants?.images[0] || `/file.svg`}
                  alt="logo-preview"
                  className="w-auto h-[80px] rounded-lg"
                />
                <div
                  id="img-placeholder"
                  className="flex flex-col align-middle justify-center p-4"
                >
                  <div className="font-bold text-lg">
                    Choose multiple images
                  </div>
                  <div>Click or Drag Images Here</div>
                </div>
              </label>
            </div>
          </div>
        </div>
        <h3 className="font-bold text-lg border-dashed border-b pb-4 border-b-slate-300">
          Attributes
        </h3>
        <div className="attribute-list flex flex-col gap-6">
          {variants.attributes &&
            variants.attributes.map((items, key) => (
              <div
                key={key}
                className="attribute-list-items flex flex-row gap-6"
              >
                <TextInput
                  id={`attr-name-${key}`}
                  name={`name`}
                  value={items.name || ""}
                  placeholder="attributes name"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputAttributes(key, e)
                  }
                />
                <TextInput
                  id={`attr-value-${key}`}
                  name={`value`}
                  value={items.value || ""}
                  placeholder="attributes value"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleInputAttributes(key, e)
                  }
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAttributes(key)}
                >
                  <TrashIcon
                    width="20"
                    height="20"
                    className="mr-2 text-red-400 cursor-pointer"
                  ></TrashIcon>
                </button>
              </div>
            ))}
        </div>
        <div className="attributes text-right">
          <Button type="button" onClick={handleAddNewAttributes}>
            <PlusIcon width="10" height="10" className="mr-2"></PlusIcon>
            Add new attributes
          </Button>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="button" onClick={handleSaveNewVariant}>
          Done
        </Button>
      </div>
    </div>
  )
}
