import { FilterConfig } from "@/components/table/TableFilters"
import { SelectOption } from "../interfaces/global.interfaces"

export function productFilter(publishStatus: SelectOption[]): FilterConfig[] {
  return [
    {
      id: "search",
      label: "Find product name",
      type: "text",
      placeholder: "Type product name...",
    },
    {
      id: "brand",
      label: "Find brand name",
      type: "text",
      placeholder: "Type brand name...",
    },
    {
      id: "category",
      label: "Find by category",
      type: "text",
      placeholder: "Type product category...",
    },
    {
      id: "store",
      label: "Find by store",
      type: "text",
      placeholder: "Type store name...",
    },
    {
      id: "price",
      label: "Find by price",
      type: "text",
      placeholder: "Type product price range...",
    },
    {
      id: "discount",
      label: "Find by discount",
      type: "text",
      placeholder: "Type product discount...",
    },
    {
      id: "publish",
      label: "Publish Status",
      type: "select",
      options: publishStatus,
    },
  ]
}
