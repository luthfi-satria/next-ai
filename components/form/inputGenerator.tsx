import Checkbox from "./inputCheckbox"
import DateInput from "./inputDate"
import SelectInput from "./inputSelect"
import TextInput from "./inputText"
import TextAreaInput from "./inputTextarea"

export default function InputGenerator({ props }: { props: any }) {
    const generateField = (obj: any, key: string) => {
        if (obj.type == 'text') {
            return (
                <TextInput key={key} label={obj.label || obj.name} name={obj.name} onChange={obj.onChange} value={obj.value} placeholder={obj.placeholder}
                />
            )
        }

        if (obj.type == 'select') {
            return (
                <SelectInput key={key} label={obj.label || obj.name} name={obj.name} onChange={obj.onChange} options={obj.options} selectedValue={obj.value} />
            )
        }

        if (obj.type == 'textarea') {
            return (
                <TextAreaInput key={key} label={obj.label || obj.name} name={obj.name} onChange={obj.onChange} value={obj.value} />
            )
        }

        if (obj.type == 'date') {
            return (
                <DateInput key={key} label={obj.label || obj.name} name={obj.name} onChange={obj.onChange} value={obj.value} />
            )
        }

        if (obj.type == 'checkbox') {
            return (
                <Checkbox key={key} label={obj.label || obj.name} name={obj.name} onChange={obj.onChange} value={obj.value} />
            )
        }
    }
    return (
        <div className="">
            {props.map((items, index) => generateField(items, index))}
        </div>
    )
}