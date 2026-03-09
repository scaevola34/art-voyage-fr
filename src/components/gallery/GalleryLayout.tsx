import { ReactNode, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, Calendar, Palette, BarChart3, LogOut, Star, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGalleryAuth } from '@/hooks/useGalleryAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/galerie/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/galerie/profil', label: 'Profil', icon: User },
  { path: '/galerie/evenements', label: 'Événements', icon: Calendar },
  { path: '/galerie/artistes', label: 'Artistes', icon: Palette },
  { path: '/galerie/stats', label: 'Statistiques', icon: BarChart3 },
];

const tierIcons = { starter: Star, pro: Zap, vitrine: Crown };
const tierLabels = { starter: 'Starter', pro: 'Pro', vitrine: 'Vitrine' };

export default function GalleryLayout({ children }: { children: ReactNode }) {
  const { user, gallery, loading, signOut } = useGalleryAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/galerie/login');
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-background flex items-center justify-center">
        <Skeleton className="h-96 w-full max-w-4xl" />
      </div>
    );
  }

  if (!user || !gallery) return null;

  const TierIcon = tierIcons[gallery.offer_tier];

  return (
    <div className="min-h-screen pt-16 bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/50 p-4 gap-2 fixed top-16 bottom-0">
        <div className="mb-4 p-3 rounded-lg bg-muted/50">
          <p className="font-semibold text-foreground text-sm truncate">{gallery.name}</p>
          <div className="flex items-center gap-1 mt-1">
            <TierIcon className="h-3 w-3 text-primary" />
            <span className="text-xs text-muted-foreground">{tierLabels[gallery.offer_tier]}</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isDisabled = item.path === '/galerie/artistes' && gallery.offer_tier === 'starter';
            return (
              <Link
                key={item.path}
                to={isDisabled ? '#' : item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  isDisabled && 'opacity-40 cursor-not-allowed'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {isDisabled && <span className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded">Pro+</span>}
              </Link>
            );
          })}
        </nav>

        <Button variant="ghost" className="justify-start text-muted-foreground" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Se déconnecter
        </Button>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex justify-around p-2">
        {navItems.slice(0, 4).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={cn('flex flex-col items-center gap-1 p-1', isActive ? 'text-primary' : 'text-muted-foreground')}>
              <item.icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
}
