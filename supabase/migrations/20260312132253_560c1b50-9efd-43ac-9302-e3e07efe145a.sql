-- API keys table for monetized API access
CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  key text NOT NULL UNIQUE,
  plan text NOT NULL DEFAULT 'free',
  requests_today integer NOT NULL DEFAULT 0,
  requests_total bigint NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_keys_service_only" ON public.api_keys
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- API key requests (public form submissions)
CREATE TABLE public.api_key_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  project_name text NOT NULL,
  use_case text NOT NULL DEFAULT '',
  plan text NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.api_key_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_key_requests_public_insert" ON public.api_key_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "api_key_requests_service_read" ON public.api_key_requests
  FOR SELECT USING (auth.role() = 'service_role');

-- API webhooks for pro plan
CREATE TABLE public.api_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  url text NOT NULL,
  secret text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.api_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_webhooks_service_only" ON public.api_webhooks
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Index for fast key lookups
CREATE INDEX idx_api_keys_key ON public.api_keys(key);
CREATE INDEX idx_api_keys_active ON public.api_keys(active);