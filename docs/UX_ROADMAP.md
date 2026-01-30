# 🎯 Roadmap UX/UI - Urbanomap

> Document de recommandations basé sur l'audit UX du 30/01/2026

---

## 📊 Résumé de l'audit

| Catégorie | Score | Priorité |
|-----------|-------|----------|
| Navigation & Architecture | ✅ Bon | Faible |
| Responsivité Mobile | ⚠️ À améliorer | Moyenne |
| Lisibilité & Hiérarchie | ⚠️ À améliorer | Moyenne |
| Appels à l'action | ✅ Bon | Faible |
| Performance perçue | ✅ Bon | Faible |

---

## 🔴 Priorité Haute (Sprint 1)

### 1. Cookie Banner - Chevauchement CTA
**Problème** : Le cookie banner chevauche le CTA "Voir la carte" en bas de la page d'accueil.

**Impact** : Expérience utilisateur dégradée, CTA moins visible.

**Solution** :
- [ ] Ajouter un `margin-bottom` au contenu quand le banner est visible
- [ ] Ou repositionner le banner en haut de page
- [ ] Réduire la hauteur du banner sur mobile

**Fichiers concernés** :
- `src/components/ConsentBanner.tsx`
- `src/pages/Home.tsx`

**Effort estimé** : 1-2 heures

---

### 2. Sidebar carte - Espacement mobile
**Problème** : La sidebar des lieux sur `/carte` prend trop d'espace sur tablette.

**Impact** : Zone de carte réduite, moins d'exploration possible.

**Solution** :
- [ ] Cacher la sidebar par défaut sur tablette (< 1024px)
- [ ] Ajouter un bouton toggle pour afficher/masquer la liste
- [ ] Utiliser un drawer bottom sur mobile pour la liste

**Fichiers concernés** :
- `src/pages/MapPage.tsx`
- `src/components/map/LocationDrawer.tsx`

**Effort estimé** : 3-4 heures

---

## 🟡 Priorité Moyenne (Sprint 2)

### 3. Footer - Lisibilité du texte
**Problème** : Le texte du footer est petit et peu contrasté.

**Impact** : Accessibilité réduite, informations difficiles à lire.

**Solution** :
- [ ] Augmenter la taille de police de `text-sm` à `text-base`
- [ ] Améliorer le contraste des liens
- [ ] Ajouter plus d'espacement entre les colonnes

**Fichiers concernés** :
- `src/components/Footer.tsx`

**Effort estimé** : 30 minutes

---

### 4. Navigation - Lien "Accueil" redondant
**Problème** : Le logo ET le lien "Accueil" mènent à la même page.

**Impact** : Confusion mineure, espace navigation gaspillé.

**Solution** :
- [ ] Supprimer le lien "Accueil" de la navigation
- [ ] Ou le remplacer par un autre lien utile (ex: "Blog", "Nouveautés")

**Fichiers concernés** :
- `src/components/Header.tsx`

**Effort estimé** : 15 minutes

---

### 5. Bouton "Suggérer un lieu" - Visibilité
**Problème** : Le CTA secondaire (outline) est moins visible que le primaire.

**Impact** : Moins de suggestions de lieux reçues.

**Solution** :
- [ ] Utiliser une variante plus visible (secondary au lieu d'outline)
- [ ] Ajouter une icône pour attirer l'attention
- [ ] Augmenter le contraste du border

**Fichiers concernés** :
- `src/pages/Home.tsx`

**Effort estimé** : 20 minutes

---

## 🟢 Priorité Basse (Sprint 3)

### 6. Animations - Cohérence
**Problème** : Animations présentes mais pourraient être plus fluides.

**Solution** :
- [ ] Ajouter des transitions sur le hover des cartes de lieux
- [ ] Animation d'entrée pour les résultats de recherche
- [ ] Skeleton loaders plus élaborés

**Fichiers concernés** :
- `src/index.css`
- `src/components/LoadingSkeleton.tsx`

**Effort estimé** : 2-3 heures

---

### 7. Carte - Amélioration des contrôles
**Problème** : Les contrôles de zoom pourraient être plus accessibles.

**Solution** :
- [ ] Augmenter la taille des boutons sur mobile (déjà fait partiellement)
- [ ] Ajouter un bouton "Recentrer sur la France"
- [ ] Afficher le niveau de zoom actuel

**Fichiers concernés** :
- `src/components/Map.tsx`
- `src/index.css`

**Effort estimé** : 2 heures

---

### 8. SEO - Métadonnées enrichies
**Problème** : Les métadonnées pourraient être plus complètes.

**Solution** :
- [ ] Ajouter des balises Open Graph pour les pages de lieux
- [ ] Implémenter le schema.org LocalBusiness pour chaque lieu
- [ ] Optimiser les titres de page pour le référencement local

**Fichiers concernés** :
- `src/components/SEO.tsx`
- `src/lib/seo/structuredData.ts`

**Effort estimé** : 3-4 heures

---

## 📱 Améliorations Mobile Spécifiques

### Menu hamburger
- [ ] Animation d'ouverture/fermeture plus fluide
- [ ] Overlay sombre quand le menu est ouvert
- [ ] Fermer le menu au clic sur un lien (déjà fait ✅)

### Touch targets
- [ ] Vérifier que tous les boutons ont au moins 44x44px
- [ ] Espacement suffisant entre les éléments cliquables

### Performance
- [ ] Lazy loading des images (déjà implémenté ✅)
- [ ] Réduction des requêtes sur mobile (connexion lente)

---

## 🎨 Suggestions Design Avancées

### Dark mode cohérent
Le site utilise un thème sombre. Vérifier :
- [ ] Tous les textes ont un contraste suffisant (WCAG AA minimum)
- [ ] Les couleurs des catégories sont bien visibles
- [ ] Les états hover/focus sont clairs

### Micro-interactions
- [ ] Animation au clic sur un marqueur de carte
- [ ] Feedback visuel lors du chargement des données
- [ ] Animation de "pull to refresh" sur mobile

---

## 📈 Métriques de succès

| Métrique | Objectif | Mesure |
|----------|----------|--------|
| Temps de chargement | < 3s | Lighthouse |
| Taux de rebond | < 50% | Analytics |
| Suggestions reçues | +20% | Base de données |
| Score accessibilité | > 90 | Lighthouse |

---

## 🗓️ Planning suggéré

| Sprint | Durée | Tâches |
|--------|-------|--------|
| Sprint 1 | 1 semaine | Tâches 1-2 (priorité haute) |
| Sprint 2 | 1 semaine | Tâches 3-5 (priorité moyenne) |
| Sprint 3 | 2 semaines | Tâches 6-8 + améliorations mobile |

---

## ✅ Déjà implémenté

- [x] Skip to content (accessibilité)
- [x] Lazy loading des pages
- [x] React Query pour le cache
- [x] Skeleton loaders
- [x] Responsive breakpoints
- [x] Analytics tracking
- [x] SEO de base
- [x] Dark mode cohérent

---

*Document généré le 30/01/2026 - Urbanomap v1.0*
