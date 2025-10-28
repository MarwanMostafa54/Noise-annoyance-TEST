import create from 'zustand'

const useStore = create((set) => ({
  count: 0,
  increase: () => set((s) => ({ count: s.count + 1 })),
  name: 'Visitor',
  setName: (n) => set({ name: n })
}))

export default useStore
