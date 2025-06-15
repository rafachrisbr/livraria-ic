
import { Badge } from "@/components/ui/badge";
import { ActivePromotion, formatDiscount } from "@/utils/promotionUtils";

interface PromotionBadgeProps {
  promotion: ActivePromotion;
  className?: string;
}

export const PromotionBadge = ({ promotion, className }: PromotionBadgeProps) => {
  return (
    <Badge 
      variant="destructive" 
      className={`bg-red-500 text-white hover:bg-red-600 ${className}`}
    >
      🏷️ {formatDiscount(promotion)}
    </Badge>
  );
};
