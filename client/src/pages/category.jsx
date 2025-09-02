import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import SearchInterface from "@/components/SearchInterface";
import TrendingCard from "@/components/TrendingCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Category() {
  const { category } = useParams();
  const [, setLocation] = useLocation();

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    retry: false,
  });

  const { data: trendingTopics = [] } = useQuery({
    queryKey: ["/api/trending"],
    retry: false,
  });

  const currentCategory = categories.find((cat) => cat.id === category);
  const categoryTopics = trendingTopics.filter((topic) => 
    topic.category.toLowerCase() === category?.toLowerCase()
  );

  const handleTopicClick = (topic) => {
    const searchParams = new URLSearchParams({ 
      q: topic.title,
      category: category || ""
    });
    setLocation(`/search?${searchParams.toString()}`);
  };

  if (!currentCategory) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground">The category you're looking for doesn't exist.</p>
        </div>
      </Layout>
    );
  }

  const iconColorClass = {
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  }[currentCategory.color] || "bg-primary/10 text-primary";

  return (
    <Layout>
      
      <main className="flex-1 pb-20 md:pb-0">
        {/* Category Hero */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="container mx-auto max-w-4xl text-center">
            <div className={`w-20 h-20 ${iconColorClass} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
              <i className={`${currentCategory.icon} text-3xl`} />
            </div>
            
            <h1 className="text-4xl font-bold mb-4" data-testid={`category-${category}-title`}>
              {currentCategory.name}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {currentCategory.description}
            </p>

            <SearchInterface 
              size="large" 
              placeholder={`Ask anything about ${currentCategory.name.toLowerCase()}...`}
            />
          </div>
        </section>

        {/* Popular Topics */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold" data-testid={`${category}-topics-title`}>
                Popular {currentCategory.name} Topics
              </h2>
              <Badge variant="secondary">
                {categoryTopics.length} topics
              </Badge>
            </div>

            {categoryTopics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryTopics.map((topic) => (
                  <TrendingCard
                    key={topic.id}
                    id={topic.id}
                    title={topic.title}
                    description={topic.description}
                    category={topic.category}
                    readTime={topic.readTime}
                    icon={topic.icon}
                    viewCount={topic.viewCount}
                    onClick={() => handleTopicClick(topic)}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className={`w-16 h-16 ${iconColorClass} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <i className={`${currentCategory.icon} text-xl`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">No topics yet</h3>
                <p className="text-muted-foreground">
                  Be the first to explore {currentCategory.name.toLowerCase()} topics!
                </p>
              </Card>
            )}
          </div>
        </section>

        {/* Related Categories */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-2xl font-semibold mb-8 text-center">
              Explore Other Categories
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories
                .filter((cat) => cat.id !== category)
                .slice(0, 3)
                .map((cat) => {
                  const catIconClass = {
                    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
                    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
                    orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
                  }[cat.color] || "bg-primary/10 text-primary";

                  return (
                    <Card 
                      key={cat.id} 
                      className="category-card rounded-2xl p-6 cursor-pointer"
                      onClick={() => setLocation(cat.href)}
                      data-testid={`related-category-${cat.id}`}
                    >
                      <div className={`w-12 h-12 ${catIconClass} rounded-xl flex items-center justify-center mb-4`}>
                        <i className={`${cat.icon} text-xl`} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{cat.name}</h3>
                      <p className="text-muted-foreground text-sm">{cat.description}</p>
                    </Card>
                  );
                })}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}