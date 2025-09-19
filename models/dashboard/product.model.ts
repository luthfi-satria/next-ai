import { FilterConfig } from "@/components/table/TableFilters"
import { SelectOption } from "../interfaces/global.interfaces"
import { ChangeEventOrValues } from "@/components/form/inputGenerator"

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
