import { SelectOption } from "@/models/interfaces/global.interfaces"
import React, { useState, useEffect, useRef, ChangeEvent } from "react"
import { LabelInput } from "./inputLabel"
import { CheckIcon, ChevronDownIcon, CogIcon } from "@heroicons/react/outline"
import { InputGeneratorType } from "./inputGenerator"

interface AutocompleteInputProps extends InputGeneratorType {
  className?: string
  options: SelectOption[]
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  label,
  value,
  onChange,
  customEvent,
  placeholder,
  id,
  className,
  options,
  name,
  isLoading = false,
}) => {
  const [inputValue, setInputValue] = useState(
    options.find((item) => item.value === value)?.label ?? "",
  )
  const [suggestions, setSuggestions] = useState(options)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showDelayedMessage, setShowDelayedMessage] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const filtered = options.filter((item) => {
      return item.label.toLowerCase().includes(inputValue?.toLowerCase())
    })
    setSuggestions(filtered)
  }, [inputValue, options])

  useEffect(() => {
    let timer

    const shouldShowDelayed =
      !isLoading && suggestions.length === 0 && inputValue.length > 0

    if (shouldShowDelayed) {
      timer = setTimeout(() => {
        setShowDelayedMessage(true)
      }, 500)
    } else {
      clearTimeout(timer)
      setShowDelayedMessage(false)
    }

    return () => {
      clearTimeout(timer)
    }
  }, [isLoading, suggestions.length, inputValue.length])

  useEffect(() => {
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setShowSuggestions(true)
    if (customEvent) {
      customEvent(e)
    }
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
          className={`${className} w-full border border-gray-400 py-1.5 px-2 rounded-tl-lg rounded-bl-xl`}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
        />
        <div className="flex align-middle border border-l-0 border-gray-400 font-bold text-sm rounded-tr-lg rounded-br-lg bg-slate-200">
          <ChevronDownIcon className="w-6" />
        </div>
      </div>
      {!isLoading && showSuggestions && suggestions.length > 0 && (
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
      {isLoading && showSuggestions && (
        <div className="absolute z-10 w-full text-gray-400 bg-white border p-2 border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
          <div className="flex flex-row gap-2 items-center w-full text-sm">
            <CogIcon className="w-6 animate-spin" />
            Fetch options, please wait...
          </div>
        </div>
      )}
      {!isLoading &&
        showSuggestions &&
        suggestions.length === 0 &&
        inputValue.length > 0 && (
          <div className="absolute z-10 w-full text-gray-700 bg-white border p-2 border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
            <div className="flex flex-row gap-2 items-center w-full text-sm font-medium">
              Data is not available.
            </div>
          </div>
        )}
    </div>
  )
}

export default AutocompleteInput
