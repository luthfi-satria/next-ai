import { FORM_LABEL } from "@/constants/formStyleConstant"
import { InputGeneratorType } from "./inputGenerator"

export const LabelInput: React.FC<InputGeneratorType> = ({
  id,
  label,
  className,
}) => {
  return (
    <label htmlFor={id} className={className || FORM_LABEL}>
      {label}
    </label>
  )
}
