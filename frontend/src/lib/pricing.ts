export const DABI_SERVICE_FEE_PERCENT = 0.05;

export function calculateDabiServiceFee(price: number): number {
  return Number((price * DABI_SERVICE_FEE_PERCENT).toFixed(2));
}

export function calculateTotalWithDabiFee(price: number): number {
  return Number((price + calculateDabiServiceFee(price)).toFixed(2));
}

export function formatGhanaCedi(amount: number): string {
  return `GH₵${amount.toLocaleString('en-GH', { maximumFractionDigits: 2 })}`;
}

export function getDabiFeeSummary(price: number) {
  const fee = calculateDabiServiceFee(price);
  return {
    price,
    fee,
    total: calculateTotalWithDabiFee(price),
    feePercent: DABI_SERVICE_FEE_PERCENT * 100,
  };
}
