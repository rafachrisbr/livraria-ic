
import { PromotionalPrice } from "@/utils/promotionUtils";
import { PromotionBadge } from "./PromotionBadge";

interface PromotionalPriceDisplayProps {
  promotionalPrice: PromotionalPrice;
  quantity?: number;
  className?: string;
}

export const PromotionalPriceDisplay = ({ 
  promotionalPrice, 
  quantity = 1, 
  className 
}: PromotionalPriceDisplayProps) => {
  const { originalPrice, promotionalPrice: finalPrice, hasPromotion, promotion } = promotionalPrice;
  
  const totalOriginal = originalPrice * quantity;
  const totalFinal = finalPrice * quantity;
  const totalDiscount = totalOriginal - totalFinal;

  if (!hasPromotion) {
    return (
      <div className={className}>
        <p className="text-lg font-bold text-gray-900">
          Total: R$ {totalFinal.toFixed(2)}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {promotion && <PromotionBadge promotion={promotion} />}
      
      <div className="space-y-1">
        <p className="text-sm text-gray-500 line-through">
          Preço original: R$ {totalOriginal.toFixed(2)}
        </p>
        <p className="text-lg font-bold text-green-600">
          Total com desconto: R$ {totalFinal.toFixed(2)}
        </p>
        <p className="text-sm text-green-600 font-medium">
          Você economiza: R$ {totalDiscount.toFixed(2)}
        </p>
      </div>
      
      {promotion?.description && (
        <p className="text-xs text-gray-600 italic">
          {promotion.description}
        </p>
      )}
    </div>
  );
};
