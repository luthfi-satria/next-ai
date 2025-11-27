import { Document as MongoDocument, ObjectId } from "mongodb"
import { Currency, PublishStatus } from "./global.interfaces"

export interface Products extends MongoDocument {
  _id?: ObjectId
  uuid: string
  name: string
  slug: string
  description: string
  sku: string
  brand: Brands
  category: string
  storeUUId: string
  images: string[]
  tags: string
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
  createdAt: string
  updatedAt: string
}

export interface searchProduct {
  name?: string
  sku?: string
  brand?: string
  category?: string
  store_id?: string
  min_price?: string
  max_price?: string
  status?: PublishStatus
  page?: string
  limit?: string
}

export interface Brands {
  name: string
  logoUrl?: string
  logoFile?: File | null
}

export interface Discount {
  type: DiscountType
  value: string
  start?: string
  end?: string
}

export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  CASHBACK = "CASHBACK",
  DELIVERY = "DELIVERY",
}

export interface ProductVariants {
  sku: string
  attributes: ProductVariantAttributes[]
  price: string
  stockQty: string
  images: string[]
  imagesFile?: File[] | null
}

export interface ProductVariantAttributes {
  name: string
  value: string
}

export enum Availability {
  INSTOCK = "IN STOCK",
  OUTSTOCK = "OUT OF STOCK",
  PREORDER = "PRE ORDER",
  BACKORDER = "BACK ORDER",
}

export interface ProductOption {
  name: string
  values: string[]
}

export interface ProductInfo {
  name: string
  slug: string
  description: string
  sku: string
  brand: Brands
  category: string
  storeUUId: string
  images?: string[]
  imagesFile?: File[] | null
  tags: string
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
  brand: <Brands>{
    name: "",
    logoUrl: "",
    logoFile: null,
  },
  category: "",
  storeUUId: "",
  images: [],
  tags: "",
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

export const initVariant: ProductVariants = {
  sku: "",
  price: "1",
  stockQty: "1",
  images: [],
  attributes: [],
}

export const initVariantAttributes: ProductVariantAttributes = {
  name: "",
  value: "",
}
