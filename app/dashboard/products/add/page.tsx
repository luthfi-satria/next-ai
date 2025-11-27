"use client"
import { Accordion, AccordionItem } from "@/components/accordion/accordion"
import InputGenerator, {
  ChangeEventOrValues,
} from "@/components/form/inputGenerator"
import AddProductBrand from "@/components/products/AddProductBrand"
import AddProductDiscount from "@/components/products/AddProductDiscount"
import AddProductImages from "@/components/products/AddProductImages"
import AddProductVariants from "@/components/products/AddProductVariants"
import { BUTTON_SUBMIT } from "@/constants/formStyleConstant"
import { PUSHAPI } from "@/helpers/apiRequest"
import { formEventHandler } from "@/helpers/formHandler"
import { addProduct, addProductType } from "@/models/dashboard/product.model"
import { SelectOption } from "@/models/interfaces/global.interfaces"
import {
  initProduct,
  ProductInfo,
} from "@/models/interfaces/products.interfaces"
import { useCategoryStore } from "@/stores/categoryStore"
import { useProductsAction, useProductsError } from "@/stores/productStore"
import {
  useStoreActions,
  useStoreFilter,
  useStoreIsLoading,
  useStoreOptions,
} from "@/stores/storesStore"
import Link from "next/link"
import { ChangeEvent, useCallback, useState } from "react"

export default function AddProductPage() {
  // const product: ProductInfo | null = null
  /** STATE FOR STORE */
  const StoreFilter = useStoreFilter()
  const StoreLoading = useStoreIsLoading()
  const StoresOptions: SelectOption[] = useStoreOptions()
  const [product, setProduct] = useState<ProductInfo>(initProduct)
  const { setStoreFilter, fetchStores } = useStoreActions()

  /** STATE FOR CATEGORY */
  const {
    CategoryFilter,
    CategoryOption,
    CategoryIsLoading,
    setCategoryFilter,
    fetchCategories,
  } = useCategoryStore()

  /** STATE FOR PRODUCTS*/
  const useError = useProductsError()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { setError, setResponseMessage } = useProductsAction()

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
    const { value } = formEventHandler(e)
    setProduct({ ...product, storeUUId: value as string })
  }

  const handleCategoryOptionsChange = (e: ChangeEventOrValues) => {
    const { value } = formEventHandler(e)
    setProduct({ ...product, category: value as string })
  }

  const handleInputChange = (e: ChangeEventOrValues) => {
    const { name, value } = formEventHandler(e)
    setProduct({ ...product, [name]: value })
  }

  const handleAdd = async (e: React.FormEvent) => {
    if (product) {
      e.preventDefault()
      setIsSubmitting(true)
      setError(null)
      try {
        const fileFields = new FormData()
        const payload = product
        if (product.brand.logoFile) {
          fileFields.append(
            "brandFiles",
            product.brand.logoFile,
            product.brand.logoFile.name,
          )
          delete payload.brand.logoFile
        }

        if (product.variants && product.variants?.length > 0) {
          product.variants.map((items, key) => {
            if (items.imagesFile?.length > 0) {
              items.imagesFile.map((img) => {
                fileFields.append(`variantImgFiles[]`, img, img.name)
              })
            }
            delete payload.variants[key].imagesFile
          })
        }

        if (product.imagesFile && product.imagesFile?.length > 0) {
          product.imagesFile.map((items) => {
            fileFields.append("imagesFile[]", items, items.name)
          })
          delete payload.imagesFile
        }

        fileFields.append("payload", JSON.stringify(payload))

        const { response, data } = await PUSHAPI<ProductInfo>(
          "POST",
          "/api/products",
          fileFields,
        )
        if (response.ok && data.success) {
          setProduct({ ...product, ...initProduct }) // Reset form
          setResponseMessage(data.message)
        } else {
          setError(data.message || "Failed to add product")
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.log(`Error: `, err.message)
          setError(err.message)
        }
      } finally {
        setTimeout(() => {
          setIsSubmitting(false)
          setResponseMessage("")
        }, 5000)
      }
    }
  }

  const handleResponse = () => {
    let message = ""
    let style = ""
    if (useError) {
      message = `Error: ${useError}`
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

  const formConf: addProductType = {
    data: product,
    store: {
      options: StoresOptions,
      handleOptionChange: handleStoreOptionsChange,
      handleSearch: searchStore,
      loadingStatus: StoreLoading,
    },
    category: {
      options: CategoryOption,
      handleOptionChange: handleCategoryOptionsChange,
      handleSearch: searchCategory,
      loadingStatus: CategoryIsLoading,
    },
    genericHandleChange: handleInputChange,
  }

  const buildForm = addProduct(formConf)

  const accordionData: AccordionItem[] = [
    {
      id: 1,
      title: "Basic product information",
      content: <InputGenerator props={buildForm} />,
    },
    {
      id: 2,
      title: "Product Brand",
      content: <AddProductBrand setProduct={setProduct} product={product} />,
    },
    {
      id: 3,
      title: "Product Discount",
      content: <AddProductDiscount product={product} setProduct={setProduct} />,
    },
    {
      id: 4,
      title: "Product images",
      content: <AddProductImages product={product} setProduct={setProduct} />,
    },
    {
      id: 5,
      title: "Product variants",
      content: <AddProductVariants product={product} setProduct={setProduct} />,
    },
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
        <form
          onSubmit={handleAdd}
          className="space-y-4 w-3/4"
          encType="multipart/form-data"
        >
          <Accordion items={accordionData} />
          <div className="">
            <button
              type="submit"
              className={BUTTON_SUBMIT}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding Product..." : "Submit Product"}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
