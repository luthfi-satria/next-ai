import React, { useState } from "react"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/outline"

export interface AccordionItem {
  id: number
  title: string
  content: string | React.ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
}

const AccordionItem: React.FC<{
  item: AccordionItem
  isOpen: boolean
  toggleItem: () => void
}> = ({ item, isOpen, toggleItem }) => {
  return (
    <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden">
      <div
        className="flex justify-between items-center w-full p-4 text-left font-semibold text-gray-800 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 capitalize"
        onClick={toggleItem}
        aria-expanded={isOpen}
      >
        <span>{item.title}</span>
        {isOpen ? (
          <ChevronUpIcon className="w-5 h-5 text-indigo-600 transition-transform duration-200" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-400 transition-transform duration-200" />
        )}
      </div>

      {/* Konten (Panel) */}
      <div
        className={`transition-max-height duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 p-4 border-t border-gray-200"
            : "max-h-0 opacity-0 p-0"
        }`}
        style={{
          padding: isOpen ? "1rem" : "0",
        }}
      >
        <div className="text-gray-600">{item.content}</div>
      </div>
    </div>
  )
}

export const Accordion: React.FC<AccordionProps> = ({ items }) => {
  const [openItemId, setOpenItemId] = useState<number | null>(null)

  const toggleItem = (itemId: number) => {
    setOpenItemId(openItemId === itemId ? null : itemId)
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openItemId === item.id}
          toggleItem={() => toggleItem(item.id)}
        />
      ))}
    </div>
  )
}
