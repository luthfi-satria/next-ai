"use client"
import InputGenerator, {
  ChangeEventOrValues,
} from "@/components/form/inputGenerator"
import { formEventHandler } from "@/helpers/formHandler"
import { SelectOption } from "@/models/interfaces/global.interfaces"
import { ProductInfo } from "@/models/interfaces/products.interfaces"
import { useCategoryStore } from "@/stores/categoryStore"
import { useProductsError } from "@/stores/productStore"
import {
  useStoreActions,
  useStoreFilter,
  useStoreOptions,
} from "@/stores/storesStore"
import Link from "next/link"
import { ChangeEvent, useCallback, useState } from "react"

export default function AddProductPage() {
  const product: ProductInfo | null = null
  /** STATE FOR STORE */
  const StoreFilter = useStoreFilter()
  const StoresOptions: SelectOption[] = useStoreOptions()
  const { setStoreFilter, fetchStores } = useStoreActions()

  /** STATE FOR CATEGORY */
  const { CategoryFilter, CategoryOption, setCategoryFilter, fetchCategories } =
    useCategoryStore()

  /** STATE FOR PRODUCTS*/
  const Error = useProductsError()
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * AUTOCOMPLETE FUNCTION
   */
  /** ############ STORE AUTOCOMPLETE ################### */
  const searchStore = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setStoreFilter({ ...StoreFilter, search: e.target.value })
      fetchStores()
    },
    [setStoreFilter, fetchStores, StoreFilter],
  )

  const searchCategory = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setCategoryFilter({ ...CategoryFilter, search: e.target.value })
      fetchCategories()
    },
    [setCategoryFilter, fetchCategories, CategoryFilter],
  )

  /** ############ CATEGORY AUTOCOMPLETE ################### */

  /** END OF AUTOCOMPLETE FUNCTION */

  const handleStoreOptionsChange = (e: ChangeEventOrValues) => {
    const { name, value } = formEventHandler(e)
    console.log("handle change")
  }

  const handleInputChange = (e: ChangeEventOrValues) => {
    console.log(`handle input change`, e)
  }

  const handleAdd = async (e: React.FormEvent) => {
    console.log(`handle add`, e)
  }

  const handleResponse = () => {
    let message = ""
    let style = ""
    if (Error) {
      message = `Error: ${Error}`
      style = "text-red-600 bg-red-300 border border-red-500"
    } else {
      message = "success"
      style = "text-green-600 bg-green-300 border border-green-500"
    }

    return (
      <div className={`h-auto flex bg-gray-50 p-2 mb-3 ${style}`}>
        <p className="text-md">{message}</p>
      </div>
    )
  }

  const inputForm = [
    {
      id: "store",
      type: "autocomplete",
      name: "store",
      label: "store",
      value: product?.storeUUId || "",
      options: StoresOptions,
      onChange: handleStoreOptionsChange,
      customEvent: searchStore,
      required: true,
    },
    {
      type: "text",
      name: "name",
      placeholder: "e.g., Awesome Kid Shoes",
      value: product?.name || "",
      onChange: handleInputChange,
      required: true,
    },
    {
      type: "text",
      name: "sku",
      placeholder: "KS202503-23-DS-00324",
      value: product?.sku || "",
      onChange: handleInputChange,
      required: true,
    },
    {
      id: "category",
      type: "autocomplete",
      label: "Category",
      name: "category",
      value: product?.category,
      options: CategoryOption,
      onChange: handleInputChange,
      customEvent: searchCategory,
      required: true,
    },
    {
      type: "textarea",
      name: "description",
      placeholder: "e.g., Product Description",
      value: product?.description || "",
      onChange: handleInputChange,
      required: true,
    },
    /*
    {
      type: "text",
      name: "tags",
      placeholder: "Product tags",
      value: product?.tags || "",
      onChange: handleInputChange,
      required: true,
    },
    */
  ]
  return (
    <>
      {/* Add Product Form */}
      <div className="w-full h-full bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        <div className="flex flex-row gap-2 justify-stretch mb-4 text-gray-800">
          <Link
            className="w-[100px] p-4 border rounded-md text-center align-middle"
            href="/dashboard/products"
          >
            Back
          </Link>
          <h2 className="h-full text-xl sm:text-2xl font-bold p-2 grow">
            Add New Product
          </h2>
        </div>
        {isSubmitting && handleResponse()}
        <form onSubmit={handleAdd} className="space-y-4 w-3/4">
          <InputGenerator props={inputForm} />
        </form>
      </div>
    </>
  )
}
