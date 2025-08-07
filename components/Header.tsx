import { BUTTON_GRADIENT_RED } from "@/constants/formStyleConstant"

// components/Header.tsx
export default function Header() {
  return (
    <header className="w-full bg-white p-5 border border-b-1 flex justify-between items-center shadow-sm">
      <h1 className="m-0 text-2xl text-black font-bold">Dashboard Overview</h1>
      <div>
        <span className="mr-2 text-stone-800">Welcome, Admin!</span>
        <button className={BUTTON_GRADIENT_RED}>Logout</button>
      </div>
    </header>
  )
}
