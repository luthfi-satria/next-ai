// VariantCard.tsx (Menggunakan React dan Tailwind CSS)

import React from "react"
import { ProductVariants } from "@/models/interfaces/products.interfaces"
import { formatCurrency } from "@/helpers/currency"

// Definisi props (sesuai dengan struktur data Anda)
interface VariantCardProps {
  variant: ProductVariants
}

const ProductCard: React.FC<VariantCardProps> = ({ variant }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition duration-300 hover:shadow-xl hover:border-indigo-400">
      {/* Gambar Varian (Placeholder) */}
      <div className="h-40 bg-gray-200 flex items-center justify-center relative">
        {/* Menggunakan placeholder gambar atau gambar asli jika ada */}
        <img
          src={variant.images[0] || "/file.svg"}
          alt={`Image for SKU ${variant.sku}`}
          className="w-full h-full object-cover"
        />
        {/* Badge Stock Qty */}
        <span
          className={`absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded-full ${
            Number(variant.stockQty) > 0
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          Stock: {variant.stockQty || 0}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* SKU dan Harga */}
        <div className="flex flex-col justify-between items-start text-left">
          <div className="flex flex-row w-full">
            <p className="text-sm font-medium text-gray-500 w-1/3">SKU</p>
            <p className="text-base font-semibold text-gray-800 break-words w-2/3">
              {variant.sku || "No SKU"}
            </p>
          </div>
          <div className="flex flex-row w-full">
            <p className="text-sm font-medium text-gray-500 w-1/3">Price</p>
            <p className="text-base font-semibold text-red-800 break-words w-2/3">
              {formatCurrency(parseFloat(variant.price))}
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-gray-200 pt-3. text-left">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Attributes:
          </p>

          {/* Daftar Atribut */}
          <div className="flex flex-wrap gap-2">
            {variant.attributes && variant.attributes.length > 0 ? (
              variant.attributes.map((attr, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full"
                >
                  {attr.name}: {attr.value}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-400">
                No attributes defined.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
