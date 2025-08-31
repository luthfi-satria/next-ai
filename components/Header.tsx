import { BUTTON_GRADIENT_RED } from "@/constants/formStyleConstant"

// components/Header.tsx
export default function Header() {
  return (
    <header className="w-full flex flex-row gap-4 justify-between bg-white p-5 border border-b items-center shadow-xs">
      <h1 className="m-0 text-2xl text-black font-bold">Dashboard Overview</h1>
      <div className="flex flex-row gap-4 justify-end items-center">
        <div className="mr-2 text-stone-800">Welcome, Admin!</div>
        <button className={BUTTON_GRADIENT_RED}>Logout</button>
      </div>
    </header>
  )
}
