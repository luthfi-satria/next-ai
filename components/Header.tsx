// components/Header.tsx
export default function Header() {
  return (
    <header className="w-full bg-white p-5 border border-b-1 flex justify-between items-center shadow-sm">
      <h1 className="m-0 text-2xl text-black font-bold">Dashboard Overview</h1>
      <div>
        <span className="mr-2 text-stone-800">Welcome, Admin!</span>
        <button style={{ padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
      </div>
    </header>
  )
}