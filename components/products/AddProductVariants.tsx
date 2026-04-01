"use client"
import {
  initVariant,
  ProductInfo,
  ProductVariants,
} from "@/models/interfaces/products.interfaces"
import Button from "../form/inputButton"
import { PlusIcon } from "@heroicons/react/outline"
import { Dispatch, SetStateAction, useState } from "react"
import {
  useAdminActions,
  useSideModalOpen,
  useSideModalTitle,
} from "@/stores/adminStore"
import AddProductVariantsAttributes from "./AddProductVariantsAttributes"
import SideModal from "../SideModal"
import ProductCard from "./productCard"

type AddProductVariants = {
  product: ProductInfo
  setProduct: Dispatch<SetStateAction<ProductInfo>>
}

export default function AddProductVariants({
  product,
  setProduct,
}: AddProductVariants) {
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [editKey, setEditKey] = useState<number | null>()
  const useModalOpen = useSideModalOpen()
  const modalTitle = useSideModalTitle()
  const { setSideModalOpen, setSideModalContent, setSideModalTitle } =
    useAdminActions()

  const [variants, setVariants] = useState<ProductVariants>(initVariant)

  const handleCloseModal = () => {
    setSideModalOpen(false)
    setSideModalContent(null)
  }

  const handleSaveVariant = () => {
    const updatedProductVariants = [...product.variants, variants]
    const updatedProduct = { ...product, variants: updatedProductVariants }
    setProduct(updatedProduct)
    setVariants(initVariant)
    setSideModalOpen(false)
  }

  const handleAddVariant = () => {
    setSideModalTitle("Manage product variant")
    setSideModalOpen(true)
    setIsEdit(false)
    setEditKey(null)
  }

  const handleEditVariant = (index: number) => {
    setSideModalOpen(true)
    setIsEdit(true)
    setEditKey(index)
    setVariants(product.variants[index])
  }

  const handleDeleteVariant = (index: number) => {
    const updatedVariants = product.variants.filter((_, key) => key !== index)
    setProduct({ ...product, variants: updatedVariants })
  }

  const handleUpdateVariant = () => {
    const variantList = [...product.variants]
    variantList[editKey] = variants
    setProduct({ ...product, variants: variantList })
    setVariants(initVariant)
    setSideModalOpen(false)
  }

  return (
    <div className="variants-wrapper flex flex-col gap-4">
      <div className="variants-btn text-right">
        <Button type="button" onClick={handleAddVariant}>
          <PlusIcon
            width="10"
            height="10"
            className="hover:cursor-pointer mr-2"
          ></PlusIcon>
          Add New Variant
        </Button>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-2">
          {product &&
            product.variants.map((items, key) => {
              return (
                <div
                  className="w-full relative group overflow-hidden bg-white shadow-lg rounded-xl"
                  key={key}
                >
                  <ProductCard
                    variant={items}
                    index={key}
                    editVariant={handleEditVariant}
                    deleteVariant={handleDeleteVariant}
                  />
                </div>
              )
            })}
        </div>
      </div>
      <SideModal
        isOpen={useModalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
      >
        <AddProductVariantsAttributes
          variants={variants}
          setVariants={setVariants}
          handleOnSave={isEdit ? handleUpdateVariant : handleSaveVariant}
        />
      </SideModal>
    </div>
  )
}
