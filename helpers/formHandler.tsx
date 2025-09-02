import { ChangeEventOrValues } from "@/components/form/inputGenerator"

export function formEventHandler(e: ChangeEventOrValues) {
  let name: string
  let value: string | number | boolean

  if ("target" in e) {
    const { target } = e as {
      target: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    }
    name = target.name

    if (target.type === "checkbox") {
      value = (target as HTMLInputElement).checked
    } else {
      value = target.value
    }
  } else {
    name = e.name
    value = e.value
  }
  return { name, value }
}
