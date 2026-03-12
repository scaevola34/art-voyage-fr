import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

// Rate limits per plan (requests per hour)
const RATE_LIMITS: Record<string, number> = {
  free: 100,
  starter: 1000,
  pro: 999999999, // effectively unlimited
};

async function authenticateRequest(
  supabase: ReturnType<typeof createClient>,
  authHeader: string | null
) {
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Invalid or missing API key", status: 401 };
  }
  const apiKey = authHeader.replace("Bearer ", "").trim();

  const { data: keyData, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("key", apiKey)
    .eq("active", true)
    .single();

  if (error || !keyData) {
    return { error: "Invalid or missing API key", status: 401 };
  }

  // Check rate limit
  const limit = RATE_LIMITS[keyData.plan] || 100;
  if (keyData.requests_today >= limit) {
    return {
      error: "Rate limit exceeded",
      retry_after: 3600,
      status: 429,
    };
  }

  // Increment counters
  await supabase
    .from("api_keys")
    .update({
      requests_today: keyData.requests_today + 1,
      requests_total: keyData.requests_total + 1,
      last_used_at: new Date().toISOString(),
    })
    .eq("id", keyData.id);

  return { keyData };
}

// Slug helpers
function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function mapLocationType(type: string) {
  const map: Record<string, string> = {
    galerie: "gallery",
    association: "association",
    musee: "museum",
    festival: "festival",
  };
  return map[type] || type;
}

// ─── Handler ───
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const url = new URL(req.url);
  // Path after the function name: /api-v1/lieux -> /lieux
  const pathParts = url.pathname.split("/api-v1");
  const path = pathParts.length > 1 ? pathParts[1] : "/";

  // Auth check
  const auth = await authenticateRequest(
    supabase,
    req.headers.get("Authorization")
  );
  if ("error" in auth) {
    return jsonResponse(
      { error: auth.error, ...(auth.retry_after ? { retry_after: auth.retry_after } : {}) },
      auth.status
    );
  }

  try {
    // ─── GET /lieux ───
    if (path === "/lieux" && req.method === "GET") {
      const region = url.searchParams.get("region");
      const type = url.searchParams.get("type");
      const ville = url.searchParams.get("ville");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
      const offset = parseInt(url.searchParams.get("offset") || "0");

      let query = supabase.from("locations").select("*", { count: "exact" });

      if (region) query = query.ilike("region", `%${region.replace(/-/g, " ")}%`);
      if (type) query = query.eq("type", mapLocationType(type));
      if (ville) query = query.ilike("city", `%${ville}%`);

      const { data, count, error } = await query
        .range(offset, offset + limit - 1)
        .order("name");

      if (error) return jsonResponse({ error: error.message }, 500);

      // Check premium status for each location
      const locationIds = (data || []).map((l: any) => l.id);
      const { data: partners } = await supabase
        .from("gallery_partners")
        .select("location_id")
        .in("location_id", locationIds)
        .eq("status", "actif");
      const premiumIds = new Set((partners || []).map((p: any) => p.location_id));

      const lieux = (data || []).map((l: any) => ({
        id: l.id,
        nom: l.name,
        type: l.type,
        adresse: l.address,
        ville: l.city,
        region: l.region,
        lat: l.coordinates?.lat,
        lng: l.coordinates?.lng,
        description: l.description,
        horaires: l.opening_hours,
        site_web: l.website,
        instagram_url: l.instagram,
        premium: premiumIds.has(l.id),
      }));

      return jsonResponse({ total: count || 0, limit, offset, lieux });
    }

    // ─── GET /lieux/:id ───
    const lieuMatch = path.match(/^\/lieux\/([^/]+)$/);
    if (lieuMatch && req.method === "GET") {
      const id = lieuMatch[1];
      const { data: lieu, error } = await supabase
        .from("locations")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !lieu) return jsonResponse({ error: "Lieu non trouvé" }, 404);

      // Get events
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .eq("location_id", id)
        .gte("end_date", new Date().toISOString().split("T")[0])
        .order("start_date");

      // Get gallery info if premium
      const { data: partner } = await supabase
        .from("gallery_partners")
        .select("*")
        .eq("location_id", id)
        .eq("status", "actif")
        .maybeSingle();

      let artistes: any[] = [];
      if (partner) {
        const { data: artists } = await supabase
          .from("gallery_artists")
          .select("*")
          .eq("gallery_id", partner.id)
          .eq("status", "actif");
        artistes = (artists || []).map((a: any) => ({
          nom: a.name,
          specialite: a.specialty,
          bio: a.bio,
          site_web: a.website_url,
        }));
      }

      return jsonResponse({
        id: lieu.id,
        nom: lieu.name,
        type: lieu.type,
        adresse: lieu.address,
        ville: lieu.city,
        region: lieu.region,
        lat: lieu.coordinates?.lat,
        lng: lieu.coordinates?.lng,
        description: lieu.description,
        horaires: lieu.opening_hours,
        site_web: lieu.website,
        instagram_url: lieu.instagram,
        premium: !!partner,
        evenements: (events || []).map((e: any) => ({
          id: e.id,
          titre: e.title,
          type: e.type,
          date_debut: e.start_date,
          date_fin: e.end_date,
          prix: e.price,
          description: e.description,
        })),
        artistes,
      });
    }

    // ─── GET /evenements ───
    if (path === "/evenements" && req.method === "GET") {
      const region = url.searchParams.get("region");
      const ville = url.searchParams.get("ville");
      const type = url.searchParams.get("type");
      const dateDebut = url.searchParams.get("date_debut");
      const dateFin = url.searchParams.get("date_fin");
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
      const offset = parseInt(url.searchParams.get("offset") || "0");

      let query = supabase.from("events").select("*, locations!events_location_id_fkey(id, name, city, coordinates)", { count: "exact" });

      if (region) query = query.ilike("region", `%${region.replace(/-/g, " ")}%`);
      if (ville) query = query.ilike("city", `%${ville}%`);
      if (type) query = query.eq("type", type);
      if (dateDebut) query = query.gte("start_date", dateDebut);
      if (dateFin) query = query.lte("end_date", dateFin);

      const { data, count, error } = await query
        .range(offset, offset + limit - 1)
        .order("start_date");

      if (error) return jsonResponse({ error: error.message }, 500);

      const evenements = (data || []).map((e: any) => ({
        id: e.id,
        titre: e.title,
        type: e.type,
        description: e.description,
        date_debut: e.start_date,
        date_fin: e.end_date,
        prix: e.price,
        lieu: e.locations
          ? {
              id: e.locations.id,
              nom: e.locations.name,
              ville: e.locations.city,
              lat: e.locations.coordinates?.lat,
              lng: e.locations.coordinates?.lng,
            }
          : null,
      }));

      return jsonResponse({ total: count || 0, limit, offset, evenements });
    }

    // ─── GET /regions ───
    if (path === "/regions" && req.method === "GET") {
      const { data: locations } = await supabase.from("locations").select("region");
      const { data: events } = await supabase.from("events").select("region");

      const regionCounts: Record<string, { lieux: number; evenements: number }> = {};
      (locations || []).forEach((l: any) => {
        if (!regionCounts[l.region]) regionCounts[l.region] = { lieux: 0, evenements: 0 };
        regionCounts[l.region].lieux++;
      });
      (events || []).forEach((e: any) => {
        if (!regionCounts[e.region]) regionCounts[e.region] = { lieux: 0, evenements: 0 };
        regionCounts[e.region].evenements++;
      });

      const regions = Object.entries(regionCounts).map(([nom, counts]) => ({
        slug: slugify(nom),
        nom,
        count_lieux: counts.lieux,
        count_evenements: counts.evenements,
      }));

      return jsonResponse({ regions });
    }

    // ─── POST /stats/click ───
    if (path === "/stats/click" && req.method === "POST") {
      const body = await req.json();
      const { lieu_id, type: clickType } = body;

      if (!lieu_id || !clickType) {
        return jsonResponse({ error: "lieu_id and type are required" }, 400);
      }

      if (!["website", "map", "favorite"].includes(clickType)) {
        return jsonResponse({ error: "type must be website, map, or favorite" }, 400);
      }

      const today = new Date().toISOString().split("T")[0];

      // Find gallery partner for this location
      const { data: partner } = await supabase
        .from("gallery_partners")
        .select("id")
        .eq("location_id", lieu_id)
        .eq("status", "actif")
        .maybeSingle();

      if (partner) {
        // Upsert stats
        const { data: existing } = await supabase
          .from("gallery_stats")
          .select("*")
          .eq("gallery_id", partner.id)
          .eq("date", today)
          .maybeSingle();

        if (existing) {
          const updates: any = {};
          if (clickType === "website") updates.website_clicks = existing.website_clicks + 1;
          if (clickType === "favorite") updates.favorites_added = existing.favorites_added + 1;
          if (clickType === "map") updates.views = existing.views + 1;
          await supabase.from("gallery_stats").update(updates).eq("id", existing.id);
        } else {
          await supabase.from("gallery_stats").insert({
            gallery_id: partner.id,
            date: today,
            views: clickType === "map" ? 1 : 0,
            website_clicks: clickType === "website" ? 1 : 0,
            favorites_added: clickType === "favorite" ? 1 : 0,
          });
        }
      }

      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: "Endpoint non trouvé" }, 404);
  } catch (err) {
    console.error("API Error:", err);
    return jsonResponse({ error: "Erreur interne du serveur" }, 500);
  }
});
