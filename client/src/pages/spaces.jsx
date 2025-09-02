import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Spaces() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data: spaces = [], isLoading } = useQuery({
    queryKey: ["/api/spaces"],
    retry: false,
  });

  const categories = ["All", "Business", "Technology", "Creative", "Academic", "Marketing"];

  const filteredSpaces = spaces.filter((space) => {
    const matchesSearch = !searchQuery || 
      space.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
      selectedCategory === "All" || 
      space.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      
      <main className="flex-1 pb-20 md:pb-0">
        {/* Hero Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4" data-testid="spaces-title">
                Spaces & Templates
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Organized collections and templates for specific topics and workflows
              </p>
            </div>

            {/* Search and Filter */}
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search spaces and templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="spaces-search"
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
                    data-testid={`spaces-category-${category.toLowerCase()}`}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Spaces Grid */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : filteredSpaces.length > 0 ? (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">
                    {filteredSpaces.length} space{filteredSpaces.length !== 1 ? 's' : ''} available
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSpaces.map((space) => (
                    <Card 
                      key={space.id} 
                      className="category-card rounded-xl p-6 group cursor-pointer"
                      data-testid={`space-card-${space.id}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${space.gradient} rounded-xl flex items-center justify-center`}>
                          <i className={`${space.icon} text-white text-xl`} />
                        </div>
                        <span className="text-xs text-muted-foreground" data-testid={`space-template-count-${space.id}`}>
                          {space.templateCount} templates
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2" data-testid={`space-title-${space.id}`}>
                        {space.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4" data-testid={`space-description-${space.id}`}>
                        {space.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {space.tags?.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No spaces found</h3>
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