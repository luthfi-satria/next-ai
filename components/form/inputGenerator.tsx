import { SelectOption } from "@/models/interfaces/global.interfaces"
import Checkbox from "./inputCheckbox"
import DateInput from "./inputDate"
import SelectInput from "./inputSelect"
import TextInput from "./inputText"
import TextAreaInput from "./inputTextarea"
import AutocompleteInput from "./inputAutocomplete"

export type ChangeEventOrValues =
  | React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | Element
    >
  | { name: string; value: string | number | boolean }

export type InputGeneratorType = {
  id?: string
  type: string
  label?: string
  name?: string
  onChange?: (e: ChangeEventOrValues) => void
  value?: string | number | boolean
  placeholder?: string
  options?: SelectOption[]
  checked?: boolean
}

export default function InputGenerator({
  outterClass = "flex flex-col gap-4",
  props,
  fieldsError,
}: {
  outterClass?: string
  props: InputGeneratorType[]
  fieldsError?: string[]
}) {
  const generateField = (obj: InputGeneratorType, key: number) => {
    if (obj.type == "text" || obj.type == "password" || obj.type == "number") {
      return (
        <TextInput
          id={obj.id || obj.name}
          type={obj.type}
          key={key}
          label={obj.label || obj.name}
          name={obj.name}
          onChange={obj.onChange}
          value={obj.value as string}
          placeholder={obj.placeholder}
          className={
            fieldsError && fieldsError.includes(obj.name)
              ? "bg-red-300  border-red-500"
              : ""
          }
        />
      )
    }

    if (obj.type == "select") {
      return (
        <SelectInput
          id={obj.id || obj.name}
          key={key}
          label={obj.label || obj.name}
          name={obj.name}
          onChange={obj.onChange}
          options={obj.options}
          selectedValue={obj.value as string}
          className={
            fieldsError && fieldsError.includes(obj.name)
              ? "bg-red-300  border-red-500"
              : ""
          }
        />
      )
    }

    if (obj.type == "textarea") {
      return (
        <TextAreaInput
          key={key}
          id={obj.id || obj.name}
          label={obj.label || obj.name}
          name={obj.name}
          onChange={obj.onChange}
          value={obj.value as string}
          className={
            fieldsError && fieldsError.includes(obj.name)
              ? "bg-red-300  border-red-500"
              : ""
          }
        />
      )
    }

    if (obj.type == "date") {
      return (
        <DateInput
          key={key}
          id={obj.id || obj.name}
          label={obj.label || obj.name}
          name={obj.name}
          onChange={obj.onChange}
          value={obj.value as string}
          className={
            fieldsError && fieldsError.includes(obj.name)
              ? "bg-red-300  border-red-500"
              : ""
          }
        />
      )
    }

    if (obj.type == "checkbox") {
      return (
        <Checkbox
          key={key}
          id={obj.id || obj.name}
          label={obj.label || obj.name}
          name={obj.name}
          onChange={obj.onChange}
          value={obj.value as string}
          checked={obj.checked}
          className={
            fieldsError && fieldsError.includes(obj.name)
              ? "bg-red-300  border-red-500"
              : ""
          }
        />
      )
    }

    if (obj.type == "autocomplete") {
      return (
        <AutocompleteInput
          key={key}
          id={obj.id || obj.name}
          label={obj.label || obj.name}
          name={obj.name}
          onChange={obj.onChange}
          value={obj.value as string}
          placeholder={obj.placeholder}
          options={obj.options}
          className={
            fieldsError && fieldsError.includes(obj.name)
              ? "bg-red-300  border-red-500"
              : ""
          }
        />
      )
    }
  }
  return (
    <div className={outterClass}>
      {props.map((items, index) => generateField(items, index))}
    </div>
  )
}
