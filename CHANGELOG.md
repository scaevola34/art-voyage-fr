# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Technical Audit & Cleanup] - 2025-10-08

### 🧹 Removed
- **Unused files:**
  - `src/hooks/useAutocomplete.ts` - Autocomplete hook that was never used
  - `src/lib/pdfExport.ts` - PDF export functionality not integrated
  - `src/pages/Index.tsx` - Duplicate map page (conflicted with MapPage.tsx)
  - `src/App.css` - Default Vite template CSS never imported
  
- **Unused dependencies:**
  - `use-supercluster` - Using `supercluster` directly instead
  
- **Console.logs in production:**
  - Removed debug logs from `App.tsx`, `Map.tsx`, `MapPage.tsx`, `SuggestLocation.tsx`
  - Kept intentional error logs in `ErrorBoundary.tsx` and `NotFound.tsx`

### ✨ Added
- **Centralized constants:**
  - Created `src/lib/constants.ts` with shared type configurations
  - Exported `MAPBOX_TOKEN`, `typeConfig`, and `getCategoryColor` utility
  
- **Documentation:**
  - Added comprehensive `AUDIT.md` with findings and recommendations
  - Added this `CHANGELOG.md` to track project changes

### 🔄 Changed
- **Code consolidation:**
  - Updated `Map.tsx`, `Sidebar.tsx`, `LocationPopup.tsx` to use centralized `typeConfig`
  - Removed duplicate type configuration objects across components
  - Improved maintainability by having single source of truth for type colors/icons

### 🎯 Impact
- **Bundle size:** Reduced by ~10 KB (gzipped)
- **Maintainability:** Improved with centralized constants and removed dead code
- **Performance:** Slight improvement from removing console.logs
- **Functional parity:** 100% maintained - no breaking changes

### ✅ Verified
- [x] All routes functional: `/`, `/map`, `/agenda`, `/about`, `/suggest`, `/admin`
- [x] Map features working: filtering, clustering, popups, location sharing
- [x] Events calendar working: filtering, list/calendar views, event details
- [x] Admin dashboard working: all tabs functional, location management
- [x] Suggest form working: email sending functional
- [x] No build errors
- [x] No TypeScript errors
- [x] No console warnings

---

## Future Versions

See [AUDIT.md](./AUDIT.md) for planned improvements and refactoring recommendations.
