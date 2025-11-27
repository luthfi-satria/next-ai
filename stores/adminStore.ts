import { ReactNode } from "react"
import { create } from "zustand"

interface AdminStoreAction {
  setSideModalOpen: (e: boolean) => void
  setSideModalTitle: (e: string) => void
  setSideModalContent: (content: ReactNode | null) => void
}

interface AdminStoreState {
  SideModalOpen: boolean
  SideModalTitle: string
  SideModalContent: ReactNode | null
  Actions: AdminStoreAction
}

const useAdminStore = create<AdminStoreState>((set, get) => {
  return {
    SideModalOpen: false,
    SideModalTitle: "",
    SideModalContent: null,
    Actions: {
      setSideModalOpen: (status: boolean) => {
        set({ SideModalOpen: status })
      },
      setSideModalTitle: (title: string) => {
        set({ SideModalTitle: title })
      },
      setSideModalContent: (content) => {
        set({ SideModalContent: content })
      },
    },
  }
})

const useSideModalOpen = () => useAdminStore((state) => state.SideModalOpen)
const useSideModalTitle = () => useAdminStore((state) => state.SideModalTitle)
const useSideModalContent = () =>
  useAdminStore((state) => state.SideModalContent)
const useAdminActions = () => useAdminStore((state) => state.Actions)

export {
  useSideModalOpen,
  useSideModalTitle,
  useSideModalContent,
  useAdminActions,
}
