
import { supabase } from "@/integrations/supabase/client";

export interface ActivePromotion {
  id: string;
  name: string;
  description?: string;
  discount_type: string;
  discount_value: number;
  start_date: string;
  end_date: string;
}

export interface PromotionalPrice {
  originalPrice: number;
  promotionalPrice: number;
  discount: number;
  promotion?: ActivePromotion;
  hasPromotion: boolean;
}

export const getActivePromotionsForProduct = async (productId: string): Promise<ActivePromotion[]> => {
  const now = new Date().toISOString();
  
  const { data: promotions, error } = await supabase
    .from('product_promotions')
    .select(`
      promotion_id,
      promotions!inner (
        id,
        name,
        description,
        discount_type,
        discount_value,
        start_date,
        end_date,
        is_active
      )
    `)
    .eq('product_id', productId)
    .eq('promotions.is_active', true)
    .lte('promotions.start_date', now)
    .gte('promotions.end_date', now);

  if (error) {
    console.error('Error fetching promotions:', error);
    return [];
  }

  return promotions?.map(p => p.promotions).filter(Boolean) || [];
};

export const calculatePromotionalPrice = (originalPrice: number, promotion: ActivePromotion): number => {
  if (promotion.discount_type === 'percentage') {
    const discountAmount = (originalPrice * promotion.discount_value) / 100;
    return originalPrice - discountAmount;
  } else if (promotion.discount_type === 'fixed_amount') {
    return Math.max(0, originalPrice - promotion.discount_value);
  }
  return originalPrice;
};

export const getBestPromotionalPrice = async (productId: string, originalPrice: number): Promise<PromotionalPrice> => {
  const promotions = await getActivePromotionsForProduct(productId);
  
  if (promotions.length === 0) {
    return {
      originalPrice,
      promotionalPrice: originalPrice,
      discount: 0,
      hasPromotion: false
    };
  }

  // Calcular o melhor preço (menor preço final)
  let bestPrice = originalPrice;
  let bestPromotion: ActivePromotion | undefined;
  
  for (const promotion of promotions) {
    const promotionalPrice = calculatePromotionalPrice(originalPrice, promotion);
    if (promotionalPrice < bestPrice) {
      bestPrice = promotionalPrice;
      bestPromotion = promotion;
    }
  }

  const discount = originalPrice - bestPrice;

  return {
    originalPrice,
    promotionalPrice: bestPrice,
    discount,
    promotion: bestPromotion,
    hasPromotion: discount > 0
  };
};

export const formatDiscount = (promotion: ActivePromotion): string => {
  if (promotion.discount_type === 'percentage') {
    return `${promotion.discount_value}% OFF`;
  } else {
    return `R$ ${promotion.discount_value.toFixed(2)} OFF`;
  }
};
