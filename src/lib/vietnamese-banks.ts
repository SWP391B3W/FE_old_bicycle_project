export interface VietnameseBank {
  code: string
  bin: string
  displayName: string
}

export const VIETNAMESE_BANKS: VietnameseBank[] = [
  { code: 'Vietcombank', bin: '970436', displayName: 'Vietcombank' },
  { code: 'VietinBank', bin: '970415', displayName: 'VietinBank' },
  { code: 'BIDV', bin: '970418', displayName: 'BIDV' },
  { code: 'Agribank', bin: '970405', displayName: 'Agribank' },
  { code: 'Techcombank', bin: '970407', displayName: 'Techcombank' },
  { code: 'ACB', bin: '970416', displayName: 'ACB' },
  { code: 'MB Bank', bin: '970422', displayName: 'MB Bank' },
  { code: 'TPBank', bin: '970423', displayName: 'TPBank' },
  { code: 'VPBank', bin: '970432', displayName: 'VPBank' },
  { code: 'HDBank', bin: '970437', displayName: 'HDBank' },
  { code: 'Sacombank', bin: '970403', displayName: 'Sacombank' },
  { code: 'VIB', bin: '970441', displayName: 'VIB' },
  { code: 'SeABank', bin: '970440', displayName: 'SeABank' },
  { code: 'OCB', bin: '970448', displayName: 'OCB' },
  { code: 'SHB', bin: '970443', displayName: 'SHB' },
  { code: 'MSB', bin: '970426', displayName: 'MSB' },
  { code: 'Eximbank', bin: '970431', displayName: 'Eximbank' },
  { code: 'LPBank', bin: '970449', displayName: 'LPBank' },
  { code: 'Nam A Bank', bin: '970428', displayName: 'Nam A Bank' },
  { code: 'PVcomBank', bin: '970412', displayName: 'PVcomBank' },
]

export function findVietnameseBankByBin(bin?: string | null) {
  if (!bin) {
    return null
  }

  return VIETNAMESE_BANKS.find((bank) => bank.bin === bin) ?? null
}

export function findVietnameseBankByCode(code?: string | null) {
  if (!code) {
    return null
  }

  const normalizedCode = code.trim().toLowerCase()
  return (
    VIETNAMESE_BANKS.find((bank) => {
      return bank.code.toLowerCase() === normalizedCode || bank.displayName.toLowerCase() === normalizedCode
    }) ?? null
  )
}