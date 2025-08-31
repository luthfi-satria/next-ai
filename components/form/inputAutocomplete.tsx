import { SelectOption } from "@/models/interfaces/global.interfaces"
import React, { useState, useEffect, useRef } from "react"
import { LabelInput } from "./inputLabel"
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/outline"

interface AutocompleteInputProps {
  label: string
  value: string
  onChange: (e: { name: string; value: string | number | boolean }) => void
  placeholder?: string
  type?: React.HTMLInputTypeAttribute
  name?: string
  id?: string
  className?: string
  options: SelectOption[]
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  id,
  className,
  options,
  name,
}) => {
  const [inputValue, setInputValue] = useState(
    options.find((item) => item.value === value)?.label ?? "",
  )
  const [suggestions, setSuggestions] = useState(options)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    // Filter data based on inputValue
    const filtered = options.filter((item) => {
      return item.value.toLowerCase().includes(inputValue?.toLowerCase())
    })
    setSuggestions(filtered)
  }, [inputValue, options])

  useEffect(() => {
    // Handle clicks outside the component to close suggestions
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [wrapperRef])

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    setShowSuggestions(true)
  }

  const handleSuggestionClick = (suggestion: {
    label: string
    value: string | number | boolean
  }) => {
    setInputValue(suggestion.label)
    onChange({ name: name || id, value: suggestion.value })
    setShowSuggestions(false)
  }

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <LabelInput id={id} label={label} />
      <div className={`w-full flex flex-row`}>
        <input
          id={id}
          name={name || id}
          type="text"
          value={inputValue}
          className={`${className} w-full border border-gray-400 p-1 rounded-tl-lg rounded-bl-xl`}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
        />
        <ChevronDownIcon className="border border-l-0 border-gray-400 font-bold text-sm w-6 rounded-tr-lg rounded-br-lg bg-slate-200" />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className={`flex flex-row justify-between p-2 cursor-pointer hover:bg-gray-100 ${suggestion.label == inputValue ? "bg-gray-200" : ""}`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.label}
              {suggestion.label == inputValue && (
                <CheckIcon className="font-bold text-xs w-6 text-slate-600" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AutocompleteInput
