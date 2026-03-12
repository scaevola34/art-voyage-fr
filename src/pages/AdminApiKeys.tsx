import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Copy, Check, Plus, Key, Trash2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const ADMIN_PASSWORD = 'streetart2025';

interface ApiKey {
  id: string;
  name: string;
  email: string;
  key: string;
  plan: string;
  requests_today: number;
  requests_total: number;
  last_used_at: string | null;
  active: boolean;
  created_at: string;
}

interface ApiKeyRequest {
  id: string;
  name: string;
  email: string;
  project_name: string;
  use_case: string;
  plan: string;
  created_at: string;
}

function generateApiKey() {
  const chars = 'abcdef0123456789';
  let key = 'umk_';
  for (let i = 0; i < 32; i++) key += chars[Math.floor(Math.random() * chars.length)];
  return key;
}

export default function AdminApiKeys() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [requests, setRequests] = useState<ApiKeyRequest[]>([]);
  const [newKey, setNewKey] = useState({ name: '', email: '', plan: 'free' });
  const [generatedKey, setGeneratedKey] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setAuthed(true);
    else toast.error('Mot de passe incorrect');
  };

  const fetchData = async () => {
    // Use service role via edge function or direct query
    const { data: keysData } = await supabase.from('api_keys').select('*').order('created_at', { ascending: false });
    const { data: reqData } = await supabase.from('api_key_requests').select('*').order('created_at', { ascending: false });
    if (keysData) setKeys(keysData as ApiKey[]);
    if (reqData) setRequests(reqData as ApiKeyRequest[]);
  };

  useEffect(() => {
    if (authed) fetchData();
  }, [authed]);

  const createKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = generateApiKey();
    const { error } = await supabase.from('api_keys').insert({ ...newKey, key });
    if (error) { toast.error('Erreur lors de la création'); return; }
    setGeneratedKey(key);
    toast.success('Clé API créée');
    fetchData();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('api_keys').update({ active: !active }).eq('id', id);
    toast.success(active ? 'Clé révoquée' : 'Clé réactivée');
    fetchData();
  };

  const deleteKey = async (id: string) => {
    if (!confirm('Supprimer cette clé définitivement ?')) return;
    await supabase.from('api_keys').delete().eq('id', id);
    toast.success('Clé supprimée');
    fetchData();
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalActive = keys.filter(k => k.active).length;
  const totalRequestsToday = keys.reduce((s, k) => s + k.requests_today, 0);
  const totalRequestsAll = keys.reduce((s, k) => s + Number(k.requests_total), 0);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <form onSubmit={login} className="space-y-4 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center">Admin — API Keys</h1>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe admin" />
          <Button type="submit" className="w-full">Accéder</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3"><Key className="h-8 w-8 text-primary" />Gestion des clés API</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setGeneratedKey(''); setNewKey({ name: '', email: '', plan: 'free' }); }}>
              <Plus className="h-4 w-4 mr-2" />Créer une clé
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle clé API</DialogTitle></DialogHeader>
            {generatedKey ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Copiez cette clé maintenant, elle ne sera plus affichée :</p>
                <div className="flex gap-2">
                  <code className="flex-1 bg-muted p-3 rounded text-xs font-mono break-all">{generatedKey}</code>
                  <Button size="icon" variant="outline" onClick={() => copyKey(generatedKey)}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <Button className="w-full" onClick={() => setDialogOpen(false)}>Fermer</Button>
              </div>
            ) : (
              <form onSubmit={createKey} className="space-y-4">
                <Input value={newKey.name} onChange={(e) => setNewKey({ ...newKey, name: e.target.value })} required placeholder="Nom du projet" />
                <Input type="email" value={newKey.email} onChange={(e) => setNewKey({ ...newKey, email: e.target.value })} required placeholder="Email du client" />
                <div className="flex gap-3">
                  {['free', 'starter', 'pro'].map((p) => (
                    <label key={p} className={`flex-1 text-center p-2 rounded-lg border cursor-pointer text-sm ${newKey.plan === p ? 'border-primary bg-primary/10' : 'border-border'}`}>
                      <input type="radio" name="plan" value={p} checked={newKey.plan === p} onChange={() => setNewKey({ ...newKey, plan: p })} className="sr-only" />
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </label>
                  ))}
                </div>
                <Button type="submit" className="w-full">Générer</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border border-border rounded-xl p-6 bg-card">
          <p className="text-sm text-muted-foreground">Clés actives</p>
          <p className="text-3xl font-bold text-primary">{totalActive}</p>
        </div>
        <div className="border border-border rounded-xl p-6 bg-card">
          <p className="text-sm text-muted-foreground">Requêtes aujourd'hui</p>
          <p className="text-3xl font-bold">{totalRequestsToday}</p>
        </div>
        <div className="border border-border rounded-xl p-6 bg-card">
          <p className="text-sm text-muted-foreground">Requêtes totales</p>
          <p className="text-3xl font-bold">{totalRequestsAll.toLocaleString()}</p>
        </div>
      </div>

      {/* Keys Table */}
      <h2 className="text-xl font-bold mb-4">Clés API</h2>
      <div className="border border-border rounded-xl overflow-hidden mb-12">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Clé</TableHead>
              <TableHead>Req. aujourd'hui</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Dernière utilisation</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((k) => (
              <TableRow key={k.id}>
                <TableCell>
                  <div className="font-medium">{k.name}</div>
                  <div className="text-xs text-muted-foreground">{k.email}</div>
                </TableCell>
                <TableCell><Badge variant="outline">{k.plan}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <code className="text-xs">{showKeys[k.id] ? k.key : k.key.slice(0, 8) + '...'}</code>
                    <button onClick={() => setShowKeys(s => ({ ...s, [k.id]: !s[k.id] }))} className="text-muted-foreground hover:text-foreground">
                      {showKeys[k.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                  </div>
                </TableCell>
                <TableCell>{k.requests_today}</TableCell>
                <TableCell>{Number(k.requests_total).toLocaleString()}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{k.last_used_at ? new Date(k.last_used_at).toLocaleDateString('fr-FR') : '—'}</TableCell>
                <TableCell>
                  <Badge variant={k.active ? 'default' : 'destructive'}>{k.active ? 'Actif' : 'Révoqué'}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => toggleActive(k.id, k.active)} title={k.active ? 'Révoquer' : 'Réactiver'}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteKey(k.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {keys.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Aucune clé API</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pending Requests */}
      <h2 className="text-xl font-bold mb-4">Demandes d'accès</h2>
      <div className="border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Projet</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>
                  <div>{r.project_name}</div>
                  {r.use_case && <div className="text-xs text-muted-foreground mt-1">{r.use_case}</div>}
                </TableCell>
                <TableCell><Badge variant="outline">{r.plan}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString('fr-FR')}</TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Aucune demande</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
