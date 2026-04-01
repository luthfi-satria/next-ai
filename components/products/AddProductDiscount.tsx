import { enumToSelectOptions } from "@/helpers/objectHelpers"
import SelectInput from "../form/inputSelect"
import {
  Discount,
  DiscountType,
  ProductInfo,
} from "@/models/interfaces/products.interfaces"
import { SelectOption } from "@/models/interfaces/global.interfaces"
import Button from "../form/inputButton"
import {
  PencilIcon,
  PlusIcon,
  SaveIcon,
  TrashIcon,
} from "@heroicons/react/outline"
import DateRangeInput from "../form/inputDateRange"
import {
  addDays,
  formatDate,
  formatDateToYYYYMMDD,
} from "@/helpers/dateHelpers"
import { Dispatch, SetStateAction, useState } from "react"
import { ChangeEventOrValues } from "../form/inputGenerator"
import { formEventHandler } from "@/helpers/formHandler"
import SideModal from "../SideModal"
import {
  useAdminActions,
  useSideModalOpen,
  useSideModalTitle,
} from "@/stores/adminStore"
import { formatCurrency } from "@/helpers/currency"
import NumberInput from "../form/inputNumber"

type AddProductDiscountProps = {
  product: ProductInfo
  setProduct: Dispatch<SetStateAction<ProductInfo>>
}

export default function AddProductDiscount({
  product,
  setProduct,
}: AddProductDiscountProps) {
  const useModalOpen = useSideModalOpen()
  const modalTitle = useSideModalTitle()
  const { setSideModalOpen, setSideModalContent } = useAdminActions()

  const discountType: SelectOption[] = enumToSelectOptions(DiscountType)
  const startDateChangeHandle = (e: ChangeEventOrValues) => {
    const { value } = formEventHandler(e)
    setDiscounts({ ...discounts, start: value as string })
  }
  const endDateChangeHandler = (e) => {
    const { value } = formEventHandler(e)
    setDiscounts({ ...discounts, end: value as string })
  }
  const date = new Date()
  const startDate = formatDateToYYYYMMDD(addDays(date, 1))
  const endDate = formatDateToYYYYMMDD(addDays(date, 30))
  const initDiscount: Discount = {
    type: DiscountType.PERCENTAGE,
    value: "0",
    start: startDate,
    end: endDate,
  }

  const [discounts, setDiscounts] = useState<Discount>(initDiscount)
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [editKey, setEditKey] = useState<number | null>()

  const handleRemoveDiscount = (keyToRemove: number) => {
    const updatedDiscounts = product.discount.filter(
      (_, index) => index !== keyToRemove,
    )

    setProduct({
      ...product,
      discount: updatedDiscounts,
    })
    console.log(`delete product`, updatedDiscounts.length)
  }

  const handleInputChange = (e: ChangeEventOrValues) => {
    const { name, value } = formEventHandler(e)
    setDiscounts({ ...discounts, [name]: value })
  }

  const handleAddDiscount = () => {
    setSideModalOpen(true)
    setIsEdit(false)
    setEditKey(null)
  }

  const handleEditDiscount = (keyToEdit: number) => {
    setSideModalOpen(true)
    setIsEdit(true)
    setEditKey(keyToEdit)
    setDiscounts(product.discount[keyToEdit])
  }

  const handleCloseModal = () => {
    setSideModalOpen(false)
    setSideModalContent(null)
  }

  const saveDiscountPlan = () => {
    if (!isEdit) {
      const discountList = [...product.discount, discounts]
      setProduct({ ...product, discount: discountList })
    } else {
      const discountList = [...product.discount]
      discountList[editKey] = discounts
      setProduct({ ...product, discount: discountList })
    }
    setSideModalOpen(false)
  }

  const discountsColor = (type: string) => {
    if (type == DiscountType.PERCENTAGE) {
      return "bg-red-800"
    }
    if (type == DiscountType.CASHBACK) {
      return "bg-teal-800"
    }
    if (type == DiscountType.DELIVERY) {
      return "bg-blue-600"
    }
  }

  return (
    <div className="discount-wrapper flex flex-col gap-4">
      {product &&
        product.discount &&
        product.discount.map((items, key) => {
          return (
            <div
              key={key}
              className={`text-white p-2 rounded-xl ${discountsColor(items.type)}`}
            >
              <div className="product-discounts relative flex flex-row gap-3 p-2">
                <div className="discount-amount text-3xl font-bold border-r border-dashed p-4 w-1/2">
                  {[DiscountType.CASHBACK, DiscountType.DELIVERY].includes(
                    items.type,
                  )
                    ? `${formatCurrency(parseFloat(items.value))}`
                    : items.value}
                  {items.type == DiscountType.PERCENTAGE && "%"}
                </div>
                <div className="discount-details flex flex-col">
                  <div className="discount-type">{items.type}</div>
                  <div className="discount-date text-left text-[14px]">
                    <div>Valid</div>
                    From:{` `}
                    {formatDate(items.start) || ""}
                  </div>
                  <div className="discount-date text-left text-[14px]">
                    Until:{` `}
                    {formatDate(items.end) || ""}
                  </div>
                </div>
              </div>
              <div className="remove-discount flex flex-row gap-3 justify-evenly text-md p-2">
                <button
                  type="button"
                  className="flex flex-row gap-2 cursor-pointer hover:text-yellow-100"
                  onClick={() => handleEditDiscount(key)}
                >
                  <PencilIcon width="20" height="20"></PencilIcon>
                  Edit
                </button>
                <button
                  type="button"
                  className="flex flex-row gap-2 cursor-pointer hover:text-yellow-100"
                  onClick={() => handleRemoveDiscount(key)}
                >
                  <TrashIcon width="20" height="20"></TrashIcon>
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      <div className="discount-btn text-right">
        <Button type="button" onClick={handleAddDiscount}>
          <PlusIcon
            width="10"
            height="10"
            className="hover:cursor-pointer mr-2"
          ></PlusIcon>
          Add Discount Plan
        </Button>
      </div>
      <SideModal
        isOpen={useModalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
      >
        <div className="discount-list flex flex-col gap-6">
          <div className="flex flex-col gap-2 p-4 border border-gray-100 rounded-lg">
            <div className="flex flex-row gap-4">
              <SelectInput
                id={`discount`}
                name="type"
                label="discount type"
                options={discountType as SelectOption[]}
                selectedValue={discounts.type}
                onChange={handleInputChange}
              />
              <NumberInput
                label="amount"
                id={`amount`}
                name="value"
                value={discounts.value}
                onChange={handleInputChange}
              />
            </div>
            <DateRangeInput
              id={`daterange-plan`}
              startDate={discounts.start}
              endDate={discounts.end}
              onEndDateChange={endDateChangeHandler}
              onStartDateChange={startDateChangeHandle}
            />
            <div className="text-right">
              <Button type="button" onClick={() => saveDiscountPlan()}>
                <SaveIcon width="10" height="10" className="mr-2"></SaveIcon>
                Save discount plan
              </Button>
            </div>
          </div>
        </div>
      </SideModal>
    </div>
  )
}
