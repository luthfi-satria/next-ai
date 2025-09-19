import { Currency } from "@/models/interfaces/global.interfaces"

export const formatCurrency = (
  amount: number,
  locale = "id-ID",
  currency = Currency.RUPIAH,
) => {
  if (amount > 0) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }
  return 0
}
