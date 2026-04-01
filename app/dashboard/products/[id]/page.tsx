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
import { ProductInfo } from "@/models/interfaces/products.interfaces"
import { useCategoryStore } from "@/stores/categoryStore"
import {
  useProductDetail,
  useProductsAction,
  useProductsError,
} from "@/stores/productStore"
import {
  useStoreActions,
  useStoreFilter,
  useStoreIsLoading,
  useStoreOptions,
} from "@/stores/storesStore"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ChangeEvent, useCallback, useEffect, useState } from "react"

export default function EditProductPage() {
  const { id } = useParams()

  /** STATE FOR STORE */
  const StoreFilter = useStoreFilter()
  const StoreLoading = useStoreIsLoading()
  const StoresOptions: SelectOption[] = useStoreOptions()
  const { setStoreFilter, fetchStores, setSelectedStore, refetchStoreOptions } =
    useStoreActions()

  /** STATE FOR CATEGORY */
  const {
    CategoryFilter,
    CategoryOption,
    CategoryIsLoading,
    setCategoryFilter,
    setSelectedCategory,
    fetchCategories,
    refetchCategoryOptions,
  } = useCategoryStore()

  /** STATE FOR PRODUCTS*/
  const useError = useProductsError()
  const detailProduct = useProductDetail()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { setError, getDetailProduct, setDetailProduct, setResponseMessage } =
    useProductsAction()
  const [initFetch, setInitFetch] = useState<boolean>(true)

  useEffect(() => {
    if (id) {
      getDetailProduct(id)
    }
  }, [id, getDetailProduct])

  useEffect(() => {
    if (initFetch && detailProduct) {
      setSelectedStore(detailProduct.storeUUId)
      setSelectedCategory(detailProduct.category)
      refetchStoreOptions()
      refetchCategoryOptions()
      setInitFetch(false)
    }
  }, [
    initFetch,
    detailProduct,
    setSelectedStore,
    refetchStoreOptions,
    setSelectedCategory,
    refetchCategoryOptions,
  ])

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
    setDetailProduct({ ...detailProduct, storeUUId: value as string })
  }

  const handleCategoryOptionsChange = (e: ChangeEventOrValues) => {
    const { value } = formEventHandler(e)
    setDetailProduct({ ...detailProduct, category: value as string })
  }

  const handleInputChange = (e: ChangeEventOrValues) => {
    const { name, value } = formEventHandler(e)
    const updatedDetailProduct = { ...detailProduct, [name]: value }
    setDetailProduct(updatedDetailProduct)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    if (detailProduct) {
      e.preventDefault()
      setIsSubmitting(true)
      setError(null)
      try {
        const fileFields = new FormData()
        const payload = detailProduct
        if (detailProduct.brand.logoFile) {
          fileFields.append(
            "brandFiles",
            detailProduct.brand.logoFile,
            detailProduct.brand.logoFile.name,
          )
          delete payload.brand.logoFile
        }

        if (detailProduct.variants && detailProduct.variants?.length > 0) {
          detailProduct.variants.map((items, key) => {
            if (items.imagesFile?.length > 0) {
              items.imagesFile.map((img) => {
                fileFields.append(`variantImgFiles[]`, img, img.name)
              })
            }
            delete payload.variants[key].imagesFile
          })
        }

        if (detailProduct.imagesFile && detailProduct.imagesFile?.length > 0) {
          detailProduct.imagesFile.map((items) => {
            fileFields.append("imagesFile[]", items, items.name)
          })
          delete payload.imagesFile
        }

        fileFields.append("payload", JSON.stringify(payload))

        const { response, data } = await PUSHAPI<ProductInfo>(
          "PUT",
          `/api/products/`,
          fileFields,
        )
        if (response.ok && data.success) {
          getDetailProduct(id)
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
    data: detailProduct,
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
      content: (
        <AddProductBrand
          product={detailProduct}
          setProduct={setDetailProduct}
        />
      ),
    },
    {
      id: 3,
      title: "Product Discount",
      content: (
        <AddProductDiscount
          product={detailProduct}
          setProduct={setDetailProduct}
        />
      ),
    },
    {
      id: 4,
      title: "Product images",
      content: (
        <AddProductImages
          product={detailProduct}
          setProduct={setDetailProduct}
        />
      ),
    },
    {
      id: 5,
      title: "Product variants",
      content: (
        <AddProductVariants
          product={detailProduct}
          setProduct={setDetailProduct}
        />
      ),
    },
  ]

  return (
    <>
      {/* Add Product Form */}
      <div className="w-full h-full bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        <div className="flex flex-row gap-2 justify-stretch mb-4 text-gray-800">
          <Link
            className="w-25 p-4 border rounded-md text-center align-middle"
            href="/dashboard/products"
          >
            Back
          </Link>
          <h2 className="h-full text-xl sm:text-2xl font-bold p-2 grow">
            Edit Product
          </h2>
        </div>
        {isSubmitting && handleResponse()}
        <form
          onSubmit={handleUpdate}
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
              {isSubmitting ? "Update Product..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
