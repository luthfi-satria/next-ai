import { SelectOption } from "@/models/interfaces/global.interfaces"
import Checkbox from "./inputCheckbox"
import DateInput from "./inputDate"
import SelectInput from "./inputSelect"
import TextInput from "./inputText"
import TextAreaInput from "./inputTextarea"

export type InputGeneratorType = {
  id?: string
  type: string
  label?: string
  name?: string
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void
  value?: string
  placeholder?: string
  options?: SelectOption[]
  checked?: boolean
}

export default function InputGenerator({
  props,
  fieldsError,
}: {
  props: InputGeneratorType[]
  fieldsError?: string[]
}) {
  const generateField = (obj: InputGeneratorType, key: number) => {
    if (obj.type == "text") {
      return (
        <TextInput
          key={key}
          label={obj.label || obj.name}
          name={obj.name}
          onChange={obj.onChange}
          value={obj.value}
          placeholder={obj.placeholder}
          className={
            fieldsError && fieldsError.includes(obj.name)
              ? "bg-red-300  border-red-500"
              : ""
          }
        />
      )
    }

    if (obj.type == "password") {
      return (
        <TextInput
          type="password"
          key={key}
          label={obj.label || obj.name}
          name={obj.name}
          onChange={obj.onChange}
          value={obj.value}
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
          key={key}
          label={obj.label || obj.name}
          name={obj.name}
          onChange={obj.onChange}
          options={obj.options}
          selectedValue={obj.value}
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
          label={obj.label || obj.name}
          name={obj.name}
          onChange={obj.onChange}
          value={obj.value}
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
          label={obj.label || obj.name}
          name={obj.name}
          onChange={obj.onChange}
          value={obj.value}
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
          label={obj.label || obj.name}
          name={obj.name}
          onChange={obj.onChange}
          value={obj.value}
          checked={obj.checked}
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
    <div className="">
      {props.map((items, index) => generateField(items, index))}
    </div>
  )
}
