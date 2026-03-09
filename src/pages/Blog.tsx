import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { blogPosts, getAllTags, getAllRegions } from '@/data/blog/posts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { ArrowRight, Calendar, X } from 'lucide-react';

const POSTS_PER_PAGE = 12;

export default function Blog() {
  const [page, setPage] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => getAllTags(), []);
  const allRegions = useMemo(() => getAllRegions(), []);

  const filteredPosts = useMemo(() => {
    return blogPosts
      .filter((p) => (!selectedRegion || p.region === selectedRegion))
      .filter((p) => (!selectedTag || p.tags.includes(selectedTag)))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedRegion, selectedTag]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  const clearFilters = () => {
    setSelectedRegion(null);
    setSelectedTag(null);
    setPage(1);
  };

  const hasFilters = selectedRegion || selectedTag;

  return (
    <>
      <SEO
        config={{
          title: 'Blog Street Art – Urbanomap',
          description: 'Articles, guides et actualités sur le street art en France. Découvrez les meilleurs spots, festivals et artistes.',
          path: '/blog',
        }}
      />

      <div className="min-h-screen bg-background pt-20">
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Le magazine street art 🎨
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Guides, actualités et découvertes de la scène street art en France
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 pb-20">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar filters — desktop */}
            <aside className="hidden lg:block w-64 shrink-0 space-y-8 sticky top-24 self-start">
              <FilterSection
                title="Régions"
                items={allRegions}
                selected={selectedRegion}
                onSelect={(v) => { setSelectedRegion(v === selectedRegion ? null : v); setPage(1); }}
              />
              <FilterSection
                title="Tags"
                items={allTags}
                selected={selectedTag}
                onSelect={(v) => { setSelectedTag(v === selectedTag ? null : v); setPage(1); }}
              />
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Mobile filters */}
              <div className="lg:hidden flex flex-wrap gap-2 mb-6">
                {allRegions.map((r) => (
                  <Badge
                    key={r}
                    variant={selectedRegion === r ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => { setSelectedRegion(r === selectedRegion ? null : r); setPage(1); }}
                  >
                    {r}
                  </Badge>
                ))}
              </div>

              {hasFilters && (
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-sm text-muted-foreground">
                    {filteredPosts.length} article{filteredPosts.length > 1 ? 's' : ''}
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                    <X className="h-3 w-3 mr-1" /> Réinitialiser
                  </Button>
                </div>
              )}

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedPosts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>

              {paginatedPosts.length === 0 && (
                <p className="text-center text-muted-foreground py-12">
                  Aucun article trouvé pour ces filtres.
                </p>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function FilterSection({ title, items, selected, onSelect }: {
  title: string;
  items: string[];
  selected: string | null;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      <div className="space-y-1">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onSelect(item)}
            className={`block w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
              selected === item
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function BlogCard({ post }: { post: typeof blogPosts[0] }) {
  const formattedDate = new Date(post.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Link to={`/blog/${post.slug}`} className="group">
      <Card className="overflow-hidden border-border bg-card hover:border-primary/30 transition-all duration-300 h-full">
        <div className="aspect-[16/9] relative overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <Badge className="absolute top-3 left-3 bg-card/80 backdrop-blur-sm text-foreground border-border">
            {post.region}
          </Badge>
        </div>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </div>
          <h2 className="text-lg font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h2>
          <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
          <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
            Lire <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
