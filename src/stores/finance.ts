import { defineStore } from 'pinia'

export type FinancePoint = { month: string; gelir: number; gider: number; marj: number }

export const useFinance = defineStore('finance', {
  state: () => ({
    series: [
      { month: 'May', gelir: 14500, gider: 5200, marj: 64 },
      { month: 'Haz', gelir: 16200, gider: 6100, marj: 62 },
      { month: 'Tem', gelir: 13800, gider: 5700, marj: 59 },
      { month: 'Ağu', gelir: 17500, gider: 6800, marj: 61 },
      { month: 'Eyl', gelir: 18800, gider: 7200, marj: 62 },
    ] as FinancePoint[]
  }),
})
