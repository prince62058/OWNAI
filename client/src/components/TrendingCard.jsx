import { Card } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function TrendingCard({
  id,
  title,
  description,
  category,
  readTime,
  icon,
  viewCount,
  onClick
}) {
  const queryClient = useQueryClient();

  const incrementViewsMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/trending/${id}/view`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trending"] });
    },
  });

  const handleClick = () => {
    incrementViewsMutation.mutate();
    onClick?.();
  };

  const getIconColorClass = (category) => {
    const colorMap = {
      Technology: "bg-primary/10 text-primary",
      Finance: "bg-green-500/10 text-green-500",
      Travel: "bg-blue-500/10 text-blue-500",
      Academic: "bg-purple-500/10 text-purple-500",
      Shopping: "bg-orange-500/10 text-orange-500",
      Health: "bg-red-500/10 text-red-500",
    };
    return colorMap[category] || "bg-primary/10 text-primary";
  };

  return (
    <Card 
      className="discover-card rounded-xl p-6 cursor-pointer"
      onClick={handleClick}
      data-testid={`trending-card-${id}`}
    >
      <div className="flex items-start space-x-3 mb-4">
        <div className={`w-8 h-8 ${getIconColorClass(category)} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <i className={`${icon} text-sm`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1" data-testid={`trending-title-${id}`}>{title}</h3>
          <p className="text-muted-foreground text-sm" data-testid={`trending-description-${id}`}>{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span data-testid={`trending-category-${id}`}>{category}</span>
        <div className="flex items-center space-x-2">
          <span data-testid={`trending-readtime-${id}`}>{readTime}</span>
          {viewCount && (
            <span data-testid={`trending-viewcount-${id}`}>• {viewCount} views</span>
          )}
        </div>
      </div>
    </Card>
  );
}