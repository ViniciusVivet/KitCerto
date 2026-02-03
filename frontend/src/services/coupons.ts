import { apiGet } from "@/lib/api";

export type Coupon = {
  id: string;
  code: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  validFrom: string;
  validUntil: string;
  maxUses: number;
  usedCount: number;
};

export async function listActiveCoupons(): Promise<Coupon[]> {
  return apiGet<Coupon[]>("/coupons");
}
