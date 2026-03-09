import { useState, useEffect, useMemo } from 'react';
import { Eye, MousePointer, Heart, TrendingUp, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import GalleryLayout from '@/components/gallery/GalleryLayout';
import { useGalleryAuth } from '@/hooks/useGalleryAuth';
import { getGalleryStats, type GalleryStat } from '@/lib/gallery/queries';
import { SEO } from '@/components/SEO';

export default function GalerieStats() {
  const { gallery } = useGalleryAuth();
  const [stats, setStats] = useState<GalleryStat[]>([]);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gallery) return;
    setLoading(true);
    getGalleryStats(gallery.id, parseInt(period)).then(data => {
      setStats(data);
      setLoading(false);
    });
  }, [gallery, period]);

  const totals = useMemo(() => {
    const totalViews = stats.reduce((s, d) => s + d.views, 0);
    const totalClicks = stats.reduce((s, d) => s + d.website_clicks, 0);
    const totalFavs = stats.reduce((s, d) => s + d.favorites_added, 0);
    const ratio = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0';
    return { totalViews, totalClicks, totalFavs, ratio };
  }, [stats]);

  const chartData = useMemo(() => stats.map(s => ({
    date: s.date.slice(5), // MM-DD
    vues: s.views,
    clics: s.website_clicks,
    favoris: s.favorites_added,
  })), [stats]);

  const exportCSV = () => {
    const header = 'Date,Vues,Clics,Favoris\n';
    const rows = stats.map(s => `${s.date},${s.views},${s.website_clicks},${s.favorites_added}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stats-${gallery?.name}-${period}j.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <GalleryLayout>
      <SEO config={{ title: 'Statistiques', description: 'Stats galerie', path: '/galerie/stats' }} />
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-foreground">Statistiques</h1>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 jours</SelectItem>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="90">90 jours</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />CSV</Button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total vues', value: totals.totalViews, icon: Eye },
            { label: 'Total clics', value: totals.totalClicks, icon: MousePointer },
            { label: 'Favoris', value: totals.totalFavs, icon: Heart },
            { label: 'Ratio clic/vue', value: `${totals.ratio}%`, icon: TrendingUp },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <s.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {stats.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">
            Pas encore de données. Les statistiques apparaîtront quand votre fiche sera consultée.
          </CardContent></Card>
        ) : (
          <>
            {/* Views chart */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Vues de la fiche</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                      <Line type="monotone" dataKey="vues" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Clicks chart */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Clics site web</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                      <Line type="monotone" dataKey="clics" stroke="hsl(var(--secondary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Favorites bar chart */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Ajouts en favoris</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                      <Bar dataKey="favoris" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </GalleryLayout>
  );
}
