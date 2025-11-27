import { FilterConfig } from "@/components/table/TableFilters"
import {
  Currency,
  PublishStatus,
  SelectOption,
} from "../interfaces/global.interfaces"
import {
  ChangeEventOrValues,
  InputGeneratorType,
} from "@/components/form/inputGenerator"
import { Availability, ProductInfo } from "../interfaces/products.interfaces"
import { ChangeEvent } from "react"
import { enumToSelectOptions } from "@/helpers/objectHelpers"

type filterOpt = {
  publishStatus: SelectOption[]
  category?: SelectOption[]
  categoryOnChange?: (e: ChangeEventOrValues) => void
  categoryLoading?: boolean
  store?: SelectOption[]
}

export function productFilter(filter: filterOpt): FilterConfig[] {
  return [
    {
      id: "search",
      label: "Find product name",
      type: "text",
      placeholder: "Type product name...",
    },
    {
      id: "sku",
      label: "Find SkU",
      type: "text",
      placeholder: "Type sku...",
    },
    {
      id: "store",
      label: "Find by Store",
      type: "autocomplete",
      placeholder: "Type store...",
      options: [],
    },
    {
      id: "category",
      label: "Find by category",
      type: "autocomplete",
      placeholder: "Select category...",
      options: filter.category,
      customEvent: filter.categoryOnChange,
      isLoading: filter.categoryLoading,
    },
    {
      id: "brand",
      label: "Find by brand",
      type: "text",
      placeholder: "Type brand...",
    },
    {
      id: "price",
      label: "Find price",
      type: "price_range",
      placeholder: "Type price name...",
    },
    {
      id: "availability",
      label: "Find by availability",
      type: "select",
      placeholder: "Type price name...",
      options: [],
    },
    {
      id: "publish",
      label: "Publish Status",
      type: "select",
      options: filter.publishStatus,
    },
  ]
}

export type addProductType = {
  data: ProductInfo
  store: {
    options: SelectOption[]
    handleOptionChange: (e: ChangeEventOrValues) => void
    handleSearch: (e: ChangeEvent<HTMLInputElement>) => void
    loadingStatus: boolean
  }
  category: {
    options: SelectOption[]
    handleOptionChange: (e: ChangeEventOrValues) => void
    handleSearch: (e: ChangeEvent<HTMLInputElement>) => void
    loadingStatus: boolean
  }
  genericHandleChange: (e: ChangeEventOrValues) => void
}
export function addProduct(config: addProductType): InputGeneratorType[] {
  const inputForm = [
    {
      id: "store",
      type: "autocomplete",
      name: "store",
      label: "store",
      value: config.data?.storeUUId ?? "",
      options: config.store.options,
      onChange: config.store.handleOptionChange,
      customEvent: config.store.handleSearch,
      required: true,
      isLoading: config.store.loadingStatus,
    },
    {
      type: "text",
      name: "name",
      placeholder: "e.g., Awesome Kid Shoes",
      value: config.data?.name ?? "",
      onChange: config.genericHandleChange,
      required: true,
    },
    {
      type: "text",
      name: "sku",
      placeholder: "KS202503-23-DS-00324",
      value: config.data?.sku ?? "",
      onChange: config.genericHandleChange,
      required: true,
    },
    {
      id: "category",
      type: "autocomplete",
      label: "Category",
      name: "category",
      value: config.data?.category,
      options: config.category.options,
      onChange: config.category.handleOptionChange,
      customEvent: config.category.handleSearch,
      required: true,
    },
    {
      type: "textarea",
      name: "description",
      placeholder: "e.g., Product Description",
      value: config.data?.description ?? "",
      onChange: config.genericHandleChange,
      required: false,
    },
    {
      type: "text",
      name: "tags",
      placeholder: "Product tags",
      value: config.data?.tags ?? "",
      onChange: config.genericHandleChange,
      required: false,
    },
    {
      type: "currency",
      name: "price",
      placeholder: `${Currency.RUPIAH}`,
      value: config.data?.price ?? "",
      onChange: config.genericHandleChange,
      required: true,
    },
    {
      type: "select",
      name: "availability",
      placeholder: "Is Available",
      value: config.data?.availability || Availability.INSTOCK,
      options: enumToSelectOptions(Availability),
      onChange: config.genericHandleChange,
      required: true,
    },
    {
      type: "number",
      name: "stockQty",
      placeholder: "Product stock",
      value: config.data?.stockQty ?? "0",
      onChange: config.genericHandleChange,
      required: true,
    },
    {
      type: "number",
      name: "minOrder",
      placeholder: "Minimum Order",
      value: config.data?.minOrder ?? "1",
      onChange: config.genericHandleChange,
      required: true,
    },
    {
      type: "text",
      name: "weight",
      placeholder: "Item Weight (Kg)",
      value: config.data?.weight ?? "1",
      onChange: config.genericHandleChange,
      required: true,
    },
    {
      type: "radio",
      name: "status",
      placeholder: "Product status",
      value: config.data?.status ?? PublishStatus.PUBLISHED,
      options: enumToSelectOptions(PublishStatus),
      onChange: config.genericHandleChange,
      required: true,
    },
  ]
  return inputForm
}
