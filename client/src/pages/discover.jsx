import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import TrendingCard from "@/components/TrendingCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Discover() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data: trendingTopics = [], isLoading } = useQuery({
    queryKey: ["/api/trending"],
    retry: false,
  });

  const categories = ["All", "Technology", "Finance", "Travel", "Academic", "Shopping", "Health"];

  const filteredTopics = trendingTopics.filter((topic) => {
    const matchesSearch = !searchQuery || 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
      selectedCategory === "All" || 
      topic.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleTopicClick = (topic) => {
    const searchParams = new URLSearchParams({ q: topic.title });
    setLocation(`/search?${searchParams.toString()}`);
  };

  return (
    <Layout>
      
      <main className="flex-1 pb-20 md:pb-0">
        {/* Hero Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4" data-testid="discover-title">
                Discover Trending Topics
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Explore the most popular questions and topics being discussed right now
              </p>
            </div>

            {/* Search and Filter */}
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trending topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="discover-search"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category === "All" ? null : category)}
                    data-testid={`category-filter-${category.toLowerCase()}`}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trending Topics Grid */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : filteredTopics.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    {filteredTopics.length} topic{filteredTopics.length !== 1 ? 's' : ''} found
                  </h2>
                  <Button variant="outline" size="sm" data-testid="sort-filter">
                    <Filter className="h-4 w-4 mr-2" />
                    Sort by popularity
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTopics.map((topic) => (
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
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No topics found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
}