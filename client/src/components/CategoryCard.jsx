import { Card } from "@/components/ui/card";
import { ArrowRight, DollarSign, Plane, ShoppingBag, GraduationCap, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const colorClasses = {
  green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
};

const iconComponents = {
  DollarSign,
  Plane,
  ShoppingBag,
  GraduationCap,
};

export default function CategoryCard({ id, name, description, icon, color, href }) {
  const IconComponent = iconComponents[icon] || DollarSign;
  const Icon = IconComponent; // Alias for clarity in the changes.

  // The original code had a Link wrapping the Card, and another Link inside for the button.
  // This resulted in nested anchor tags, which is invalid HTML and can cause issues.
  // The fix involves removing the outer Link and ensuring the inner Link is correctly placed within the Card.

  return (
      <Card className="group p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border border-border/50 hover:border-primary/20">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${color}-100 dark:bg-${color}-900/20`}>
              <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors" data-testid={`category-title-${id}`}>
                {name}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4" data-testid={`category-description-${id}`}>
                {description}
              </p>
              <Link href={href}>
                <Button variant="outline" size="sm" className="mt-2">
                  Explore {name} <ArrowUpRight className="ml-2 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
  );
}