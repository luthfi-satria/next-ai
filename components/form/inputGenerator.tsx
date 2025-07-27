import Checkbox from "./inputCheckbox"
import DateInput from "./inputDate"
import SelectInput from "./inputSelect"
import TextInput from "./inputText"
import TextAreaInput from "./inputTextarea"

export default function InputGenerator({ props, fieldsError }: { props: any, fieldsError?: string[] }) {
    const generateField = (obj: any, key: string) => {
        if (obj.type == 'text') {
            return (
                <TextInput key={key} label={obj.label || obj.name} name={obj.name} onChange={obj.onChange} value={obj.value} placeholder={obj.placeholder} className={fieldsError && fieldsError.includes(obj.name) ? 'bg-red-300  border-red-500' : ''}
                />
            )
        }

        if (obj.type == 'password') {
            return (
                <TextInput type="password" key={key} label={obj.label || obj.name} name={obj.name} onChange={obj.onChange} value={obj.value} placeholder={obj.placeholder} className={fieldsError && fieldsError.includes(obj.name) ? 'bg-red-300  border-red-500' : ''}
                />
            )
        }

        if (obj.type == 'select') {
            return (
                <SelectInput key={key} label={obj.label || obj.name} name={obj.name} onChange={obj.onChange} options={obj.options} selectedValue={obj.value} className={fieldsError && fieldsError.includes(obj.name) ? 'bg-red-300  border-red-500' : ''}/>
            )
        }

        if (obj.type == 'textarea') {
            return (
                <TextAreaInput key={key} label={obj.label || obj.name} name={obj.name} onChange={obj.onChange} value={obj.value} className={fieldsError && fieldsError.includes(obj.name) ? 'bg-red-300  border-red-500' : ''} />
            )
        }

        if (obj.type == 'date') {
            return (
                <DateInput key={key} label={obj.label || obj.name} name={obj.name} onChange={obj.onChange} value={obj.value} className={fieldsError && fieldsError.includes(obj.name) ? 'bg-red-300  border-red-500' : ''} />
            )
        }

        if (obj.type == 'checkbox') {
            return (
                <Checkbox key={key} label={obj.label || obj.name} name={obj.name} onChange={obj.onChange} value={obj.value} checked={obj.checked} className={fieldsError && fieldsError.includes(obj.name) ? 'bg-red-300  border-red-500' : ''} />
            )
        }
    }
    return (
        <div className="">
            {props.map((items, index) => generateField(items, index))}
        </div>
    )
}