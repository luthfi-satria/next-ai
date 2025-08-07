import { Document as MongoDocument, ObjectId } from "mongodb"
import { Currency, PublishStatus } from "./global.interfaces"

export interface Products extends MongoDocument {
  _id?: ObjectId
  uuid: string
  name: string
  slug: string
  description: string
  sku: string
  brand: Brand
  category: string
  storeUUId: string
  images: string[]
  tags: string[]
  price: number
  currency: Currency
  discount: Discount[]
  availability: Availability
  stockQty: number
  minOrder: number
  options: ProductOption[]
  status: PublishStatus
  weight: number
  variants: ProductVariants[]
  averageRating: number
  createdAt: Date
  updatedAt: Date
}

export type Brand = {
  name: string
  logoUrl: string
}

export type Discount = {
  type: string
  value: number
  start: Date
  end: Date
}

export type ProductVariants = {
  sku: string
  attributes: ProductVariantAttributes[]
  price: number
  stockQty: number
  images: string[]
}

export type ProductVariantAttributes = {
  name: string
  value: string
}

export enum Availability {
  INSTOCK = "IN STOCK",
  OUTSTOCK = "OUT OF STOCK",
  PREORDER = "PRE ORDER",
  BACKORDER = "BACK ORDER",
}

export type ProductOption = {
  name: string
  values: string[]
}

export type ProductInfo = {
  name: string
  slug: string
  description: string
  sku: string
  brand: Brand
  category: string
  storeUUId: string
  images?: string[]
  tags: string[]
  price: number
  currency: Currency
  discount?: Discount[]
  availability: Availability
  stockQty: number
  minOrder: number
  options?: ProductOption[]
  status: PublishStatus
  weight: number
  variants?: ProductVariants[]
}

export const initProduct: ProductInfo = {
  name: "",
  slug: "",
  description: "",
  sku: "",
  brand: <Brand>{
    name: "",
    logoUrl: "",
  },
  category: "",
  storeUUId: "",
  images: [],
  tags: [],
  price: 0,
  currency: Currency.RUPIAH,
  discount: <Discount[]>[],
  availability: Availability.INSTOCK,
  stockQty: 1,
  minOrder: 1,
  options: <ProductOption[]>[],
  status: PublishStatus.PUBLISHED,
  weight: 1,
  variants: <ProductVariants[]>[],
}
