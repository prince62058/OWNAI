import { Card } from "@/components/ui/card";
import { ArrowRight, DollarSign, Plane, ShoppingBag, GraduationCap } from "lucide-react";
import { Link } from "wouter";

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
  const iconColorClass = colorClasses[color] || colorClasses.blue;
  const IconComponent = iconComponents[icon] || DollarSign;

  return (
    <Link href={href} data-testid={`category-${id}`}>
      <a>
        <Card className="category-card rounded-2xl p-6 group cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${iconColorClass} rounded-xl flex items-center justify-center`}>
              <IconComponent className="h-6 w-6" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="text-lg font-semibold mb-2" data-testid={`category-title-${id}`}>{name}</h3>
          <p className="text-muted-foreground text-sm" data-testid={`category-description-${id}`}>{description}</p>
        </Card>
      </a>
    </Link>
  );
}