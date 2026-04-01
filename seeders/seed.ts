// file seeders/seed.ts
import { PopulateTable, PUSHAPI } from "@/helpers/apiRequest"
import { Category } from "@/models/interfaces/category.interfaces"
import { Currency, PublishStatus } from "@/models/interfaces/global.interfaces"
import {
  Availability,
  DiscountType,
  ProductInfo,
} from "@/models/interfaces/products.interfaces"
import { Stores } from "@/models/interfaces/stores.interfaces"
import { faker } from "@faker-js/faker"
import axios from "axios"
import FormData from "form-data"

// KONFIGURASI
const JUMLAH_DATA = 10

// Pindahkan pemanggilan ke dalam function agar lebih aman
async function seedProducts() {
  const targetStoreIds = await getAllStores()
  const targetCategoryIds = await getAllCategory()

  if (!targetStoreIds?.length || !targetCategoryIds?.length) {
    console.error(
      "❌ Gagal mengambil data Store atau Kategori. Pastikan API berjalan.",
    )
    return
  }

  console.log(`🚀 Memulai generate ${JUMLAH_DATA} produk...`)

  for (let i = 0; i < JUMLAH_DATA; i++) {
    // Simulasi pengambilan gambar dari internet sebagai "File"
    let imageBuffer: Buffer | null = null
    try {
      const imageUrl = faker.image.urlPicsumPhotos()
      const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer" })
      imageBuffer = Buffer.from(imgRes.data)
    } catch (e) {
      console.warn("⚠️ Gagal download gambar, lanjut tanpa file...")
    }

    // Kita gunakan Record<string, any> karena PUSHAPI biasanya menerima data mentah
    // yang nantinya akan diconvert ke FormData di dalam helper Anda
    const dummyProduct: ProductInfo = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      slug: "",
      currency: Currency.RUPIAH,
      sku: faker.commerce.isbn(10),
      brand: {
        name: faker.company.name(),
        logoUrl: faker.image.urlPicsumPhotos(),
      },
      category: faker.helpers.arrayElement(targetCategoryIds),
      storeUUId: faker.helpers.arrayElement(targetStoreIds),
      tags: "dummy, electronics",
      price: parseFloat(faker.commerce.price({ min: 1000, max: 5000000 })),
      discount: [
        {
          type: DiscountType.CASHBACK,
          value: "10",
          start: new Date().toISOString(),
          end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      availability: Availability.INSTOCK,
      stockQty: faker.number.int({ min: 1, max: 100 }),
      minOrder: 1,
      options: [
        { name: "material", values: [faker.commerce.productMaterial()] },
      ],
      status: PublishStatus.PUBLISHED,
      weight: 1,
    }

    try {
      const fileFields = new FormData()
      const payload = dummyProduct
      if (dummyProduct.brand.logoFile) {
        fileFields.append(
          "brandFiles",
          dummyProduct.brand.logoFile,
          dummyProduct.brand.logoFile.name,
        )
        delete payload.brand.logoFile
      }

      if (imageBuffer) {
        fileFields.append("imagesFile", imageBuffer, {
          filename: `${dummyProduct.name}.jpg`,
          contentType: "image/jpeg",
        })
      }

      fileFields.append("payload", JSON.stringify(payload))
      const response = await axios.post(
        "http://localhost:3000/api/products",
        fileFields,
        {
          headers: {
            ...fileFields.getHeaders(), // WAJIB: Untuk menyertakan boundary multipart
          },
        },
      )

      if (response.status === 200 || response.status === 201) {
        console.log(`✅ Berhasil: ${dummyProduct.name}`)
      }
    } catch (error: any) {
      console.error(`❌ [${i + 1}] Error: ${error.message}`)
    }
  }
  console.log("✨ Selesai!")
}

// Helper Functions
async function getAllStores() {
  try {
    const { response, ApiResponse } = await PopulateTable<Stores[]>(
      "http://localhost:3000/api/stores",
      {},
      1,
      100,
    )
    return response.ok && ApiResponse.success
      ? ApiResponse.results.data.map((item: Stores) => item._id.toString())
      : []
  } catch (e) {
    return []
  }
}

async function getAllCategory() {
  try {
    const { response, ApiResponse } = await PopulateTable<Category[]>(
      "http://localhost:3000/api/categories",
      {},
      1,
      100,
    )
    return response.ok && ApiResponse.success
      ? ApiResponse.results.data.map((item: Category) => item._id.toString())
      : []
  } catch (e) {
    return []
  }
}

seedProducts()
