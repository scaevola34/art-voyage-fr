import { useParams, Link, Navigate } from 'react-router-dom';
import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { getPostBySlug, getRelatedPosts } from '@/data/blog/posts';
import { SEO } from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;
  const related = useMemo(() => (slug ? getRelatedPosts(slug, 3) : []), [slug]);

  if (!post) return <Navigate to="/blog" replace />;

  const formattedDate = new Date(post.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <SEO
        config={{
          title: `${post.title} – Urbanomap`,
          description: post.excerpt,
          path: `/blog/${post.slug}`,
          image: post.image || undefined,
          type: 'article',
        }}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          datePublished: post.date,
          description: post.excerpt,
          image: post.image,
          author: { '@type': 'Organization', name: 'Urbanomap' },
        }}
      />

      <div className="min-h-screen bg-background pt-16">
        {/* Hero image */}
        <div className="w-full h-64 md:h-80 relative overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20">
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-20 relative z-10 pb-20">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Article */}
            <article className="flex-1 min-w-0 max-w-3xl">
              {/* Breadcrumb */}
              <Breadcrumb className="mb-6">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild><Link to="/">Accueil</Link></BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild><Link to="/blog">Blog</Link></BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="line-clamp-1">{post.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <header className="mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="outline">{post.region}</Badge>
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">
                  {post.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formattedDate}
                </div>
              </header>

              {/* Markdown content */}
              <div className="prose prose-invert prose-lg max-w-none
                prose-headings:text-foreground prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-strong:text-foreground
                prose-li:text-muted-foreground
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              ">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>

              {/* Related posts */}
              {related.length > 0 && (
                <section className="mt-16 pt-10 border-t border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Articles suggérés</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {related.map((r) => (
                      <Link key={r.slug} to={`/blog/${r.slug}`} className="group">
                        <Card className="overflow-hidden border-border bg-card hover:border-primary/30 transition-all h-full">
                          <div className="aspect-[16/9] bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
                            {r.image && (
                              <img
                                src={r.image}
                                alt={r.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                              {r.title}
                            </h3>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0 space-y-8 sticky top-24 self-start">
              {/* Mentioned locations */}
              {post.mentionedLocations && post.mentionedLocations.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Lieux mentionnés
                  </h3>
                  <div className="space-y-3">
                    {post.mentionedLocations.map((loc) => (
                      <Link
                        key={loc.name}
                        to={`/carte?region=${encodeURIComponent(loc.region)}`}
                        className="block px-3 py-2 rounded-md bg-muted/50 hover:bg-primary/10 transition-colors"
                      >
                        <span className="text-sm font-medium text-foreground">{loc.name}</span>
                        <span className="block text-xs text-muted-foreground">{loc.region}</span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    to="/carte"
                    className="mt-4 inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline"
                  >
                    Voir la carte <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}

              {/* Tags */}
              <div className="bg-card border border-border rounded-lg p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`}>
                      <Badge variant="outline" className="hover:bg-primary/10 cursor-pointer">{tag}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
