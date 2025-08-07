import { FORM_LABEL } from "@/constants/formStyleConstant"

interface TextLabelProps {
  id: string
  label: string
  className?: string
}
export const LabelInput: React.FC<TextLabelProps> = ({
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
