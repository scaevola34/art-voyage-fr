import { useState } from 'react';
import { Code, Zap, Shield, Globe, ArrowRight, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

const DEMO_KEY = 'umk_demo_a3f9b2c1d4e5f6789012345678abcdef';

const plans = [
  {
    name: 'Free',
    price: '0€',
    period: '',
    features: ['100 requêtes/heure', 'Endpoints lieux et événements', 'Données de base', 'Usage personnel et prototypes'],
    highlight: false,
  },
  {
    name: 'Starter',
    price: '200€',
    period: '/mois',
    features: ['1 000 requêtes/heure', 'Tous les endpoints', 'Données complètes (premium inclus)', 'Support email'],
    highlight: true,
  },
  {
    name: 'Pro',
    price: '500€',
    period: '/mois',
    features: ['Illimité', 'Tous les endpoints', 'Webhook nouveaux lieux', 'SLA 99,9%', 'Support prioritaire'],
    highlight: false,
  },
];

const endpoints = [
  {
    method: 'GET',
    path: '/api/v1/lieux',
    description: 'Liste paginée de tous les lieux street art référencés.',
    params: [
      { name: 'region', type: 'string', required: false, desc: 'Slug de la région (ex: ile-de-france)' },
      { name: 'type', type: 'string', required: false, desc: '"galerie" | "association" | "musee" | "festival"' },
      { name: 'ville', type: 'string', required: false, desc: 'Nom de la ville' },
      { name: 'limit', type: 'number', required: false, desc: 'Nombre de résultats (défaut 50, max 200)' },
      { name: 'offset', type: 'number', required: false, desc: 'Offset de pagination (défaut 0)' },
    ],
    curl: `curl -X GET "https://urbanomap.eu/api/v1/lieux?region=ile-de-france&type=galerie&limit=10" \\
  -H "Authorization: Bearer ${DEMO_KEY}"`,
    response: `{
  "total": 42,
  "limit": 10,
  "offset": 0,
  "lieux": [
    {
      "id": "a1b2c3d4-...",
      "nom": "Galerie Itinerrance",
      "type": "gallery",
      "adresse": "24 Bd du Général Jean Simon",
      "ville": "Paris",
      "region": "Île-de-France",
      "lat": 48.8606,
      "lng": 2.3376,
      "description": "Première galerie dédiée au street art...",
      "horaires": "Mar-Sam: 14h-19h",
      "site_web": "https://itinerrance.fr",
      "instagram_url": "@galerieitinerrance",
      "premium": true
    }
  ]
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/lieux/:id',
    description: 'Fiche complète d\'un lieu avec événements actifs et artistes si galerie premium.',
    params: [{ name: 'id', type: 'uuid', required: true, desc: 'Identifiant unique du lieu' }],
    curl: `curl -X GET "https://urbanomap.eu/api/v1/lieux/a1b2c3d4-..." \\
  -H "Authorization: Bearer ${DEMO_KEY}"`,
    response: `{
  "id": "a1b2c3d4-...",
  "nom": "Galerie Itinerrance",
  "type": "gallery",
  "premium": true,
  "evenements": [
    { "id": "...", "titre": "Expo Street Legends", "date_debut": "2026-04-01" }
  ],
  "artistes": [
    { "nom": "Invader", "specialite": "collage" }
  ]
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/evenements',
    description: 'Liste paginée des événements street art avec filtres.',
    params: [
      { name: 'region', type: 'string', required: false, desc: 'Slug de la région' },
      { name: 'ville', type: 'string', required: false, desc: 'Nom de la ville' },
      { name: 'type', type: 'string', required: false, desc: '"expo_solo" | "expo_collective" | "vernissage" | "atelier" | "festival"' },
      { name: 'date_debut', type: 'date', required: false, desc: 'Format YYYY-MM-DD' },
      { name: 'date_fin', type: 'date', required: false, desc: 'Format YYYY-MM-DD' },
      { name: 'limit', type: 'number', required: false, desc: 'Max 200' },
      { name: 'offset', type: 'number', required: false, desc: 'Défaut 0' },
    ],
    curl: `curl -X GET "https://urbanomap.eu/api/v1/evenements?ville=Paris&limit=5" \\
  -H "Authorization: Bearer ${DEMO_KEY}"`,
    response: `{
  "total": 23,
  "limit": 5,
  "offset": 0,
  "evenements": [
    {
      "id": "...",
      "titre": "Street Art Fest",
      "type": "festival",
      "date_debut": "2026-06-15",
      "date_fin": "2026-06-20",
      "lieu": { "id": "...", "nom": "Grenoble", "ville": "Grenoble", "lat": 45.17, "lng": 5.72 }
    }
  ]
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/regions',
    description: 'Liste des régions disponibles avec nombre de lieux et événements.',
    params: [],
    curl: `curl -X GET "https://urbanomap.eu/api/v1/regions" \\
  -H "Authorization: Bearer ${DEMO_KEY}"`,
    response: `{
  "regions": [
    { "slug": "ile-de-france", "nom": "Île-de-France", "count_lieux": 42, "count_evenements": 15 },
    { "slug": "auvergne-rhone-alpes", "nom": "Auvergne-Rhône-Alpes", "count_lieux": 18, "count_evenements": 7 }
  ]
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/stats/click',
    description: 'Incrémente les statistiques d\'un lieu (clics site web, carte, favoris).',
    params: [
      { name: 'lieu_id', type: 'uuid', required: true, desc: 'Identifiant du lieu' },
      { name: 'type', type: 'string', required: true, desc: '"website" | "map" | "favorite"' },
    ],
    curl: `curl -X POST "https://urbanomap.eu/api/v1/stats/click" \\
  -H "Authorization: Bearer ${DEMO_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{"lieu_id": "a1b2c3d4-...", "type": "website"}'`,
    response: `{ "success": true }`,
  },
];

const errorCodes = [
  { code: 200, meaning: 'Succès', example: '{ "total": 42, "lieux": [...] }' },
  { code: 400, meaning: 'Requête invalide — paramètres manquants ou incorrects', example: '{ "error": "lieu_id and type are required" }' },
  { code: 401, meaning: 'Clé API manquante ou invalide', example: '{ "error": "Invalid or missing API key" }' },
  { code: 404, meaning: 'Ressource non trouvée', example: '{ "error": "Lieu non trouvé" }' },
  { code: 429, meaning: 'Limite de requêtes dépassée', example: '{ "error": "Rate limit exceeded", "retry_after": 3600 }' },
  { code: 500, meaning: 'Erreur serveur interne', example: '{ "error": "Erreur interne du serveur" }' },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="absolute top-3 right-3 p-1.5 rounded bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

export default function Developers() {
  const [form, setForm] = useState({ name: '', email: '', project_name: '', use_case: '', plan: 'free' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from('api_key_requests').insert(form);
      if (error) throw error;
      setSubmitted(true);
      toast.success('Demande envoyée ! Nous vous recontacterons sous 48h.');
    } catch {
      toast.error("Erreur lors de l'envoi de la demande.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="API Développeurs — Urbanomap" description="Accédez aux données street art en France via une API REST documentée." />

      {/* Hero */}
      <section className="relative py-24 px-4" style={{ background: 'linear-gradient(180deg, hsl(240 20% 6%), hsl(var(--background)))' }}>
        <div className="container mx-auto max-w-5xl text-center">
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary">API v1</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            API Street Art<br />
            <span className="text-primary">Données en temps réel</span> pour vos applications
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Accédez à + de 500 lieux, galeries et événements street art en France via une API REST simple et documentée.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild><a href="#access-form"><Zap className="h-4 w-4 mr-2" />Demander un accès gratuit</a></Button>
            <Button size="lg" variant="outline" asChild><a href="#documentation"><Code className="h-4 w-4 mr-2" />Voir la documentation</a></Button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">Tarifs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.name} className={`rounded-xl border p-8 flex flex-col ${plan.highlight ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border bg-card'}`}>
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-1">
                  {plan.price}<span className="text-base font-normal text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full" variant={plan.highlight ? 'default' : 'outline'} asChild>
                  <a href="#access-form">Demander un accès</a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation */}
      <section id="documentation" className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">Documentation API</h2>
          <p className="text-center text-muted-foreground mb-12">Base URL : <code className="bg-muted px-2 py-1 rounded text-sm text-primary">https://urbanomap.eu/api/v1</code></p>

          <div className="space-y-12">
            {endpoints.map((ep) => (
              <div key={ep.path} className="border border-border rounded-xl overflow-hidden">
                <div className="p-6 bg-card">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={ep.method === 'GET' ? 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30' : 'bg-amber-600/20 text-amber-400 border-amber-600/30'}>
                      {ep.method}
                    </Badge>
                    <code className="text-sm font-mono text-foreground">{ep.path}</code>
                  </div>
                  <p className="text-muted-foreground text-sm">{ep.description}</p>
                </div>

                {ep.params.length > 0 && (
                  <div className="border-t border-border p-6">
                    <h4 className="text-sm font-semibold mb-3">Paramètres</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Nom</th>
                            <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Type</th>
                            <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Requis</th>
                            <th className="text-left py-2 text-muted-foreground font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ep.params.map((p) => (
                            <tr key={p.name} className="border-b border-border/50">
                              <td className="py-2 pr-4"><code className="text-primary text-xs">{p.name}</code></td>
                              <td className="py-2 pr-4 text-muted-foreground">{p.type}</td>
                              <td className="py-2 pr-4">{p.required ? <Badge variant="destructive" className="text-xs">Oui</Badge> : <span className="text-muted-foreground">Non</span>}</td>
                              <td className="py-2 text-muted-foreground">{p.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="border-t border-border p-6">
                  <h4 className="text-sm font-semibold mb-3">Exemple de requête</h4>
                  <div className="relative">
                    <pre className="bg-muted/50 rounded-lg p-4 text-xs font-mono overflow-x-auto text-muted-foreground">{ep.curl}</pre>
                    <CopyButton text={ep.curl} />
                  </div>
                </div>

                <div className="border-t border-border p-6">
                  <h4 className="text-sm font-semibold mb-3">Réponse</h4>
                  <div className="relative">
                    <pre className="bg-muted/50 rounded-lg p-4 text-xs font-mono overflow-x-auto text-primary/80">{ep.response}</pre>
                    <CopyButton text={ep.response} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Error Codes */}
      <section className="py-16 px-4 bg-card/50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold mb-8">Codes d'erreur</h2>
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="text-left p-4 font-medium">Code</th>
                  <th className="text-left p-4 font-medium">Signification</th>
                  <th className="text-left p-4 font-medium">Exemple</th>
                </tr>
              </thead>
              <tbody>
                {errorCodes.map((ec) => (
                  <tr key={ec.code} className="border-b border-border/50">
                    <td className="p-4"><Badge variant={ec.code >= 400 ? 'destructive' : 'default'} className="font-mono">{ec.code}</Badge></td>
                    <td className="p-4 text-muted-foreground">{ec.meaning}</td>
                    <td className="p-4"><code className="text-xs bg-muted/50 px-2 py-1 rounded">{ec.example}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Access Request Form */}
      <section id="access-form" className="py-20 px-4">
        <div className="container mx-auto max-w-xl">
          <h2 className="text-3xl font-bold text-center mb-4">Demander un accès</h2>
          <p className="text-center text-muted-foreground mb-8">
            Remplissez ce formulaire et nous vous enverrons votre clé API sous 48h.
          </p>

          {submitted ? (
            <div className="text-center p-8 border border-primary/30 rounded-xl bg-primary/5">
              <Check className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Demande envoyée !</h3>
              <p className="text-muted-foreground">Nous vous recontacterons sous 48h avec votre clé API.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nom</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Votre nom" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="email@exemple.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Nom du projet</label>
                <Input value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} required placeholder="App mobile Lyon Street Art" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Cas d'usage</label>
                <Textarea value={form.use_case} onChange={(e) => setForm({ ...form, use_case: e.target.value })} placeholder="Décrivez comment vous utiliserez l'API..." rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">Plan souhaité</label>
                <div className="flex gap-4">
                  {['free', 'starter', 'pro'].map((p) => (
                    <label key={p} className={`flex-1 text-center p-3 rounded-lg border cursor-pointer transition-colors ${form.plan === p ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-muted-foreground'}`}>
                      <input type="radio" name="plan" value={p} checked={form.plan === p} onChange={() => setForm({ ...form, plan: p })} className="sr-only" />
                      <span className="capitalize font-medium">{p === 'free' ? 'Free (0€)' : p === 'starter' ? 'Starter (200€/m)' : 'Pro (500€/m)'}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
