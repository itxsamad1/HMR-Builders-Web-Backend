-- Handy SQL queries for NeonDB

-- 1) Upsert user from Google OAuth-like payload (backend)
-- Params: $1=email, $2=name, $3=google_id, $4=profile_image
INSERT INTO users (email, name, google_id, profile_image, is_email_verified)
VALUES ($1, $2, $3, $4, TRUE)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  google_id = COALESCE(users.google_id, EXCLUDED.google_id),
  profile_image = COALESCE(EXCLUDED.profile_image, users.profile_image),
  updated_at = NOW()
RETURNING id, email, name, profile_image;

-- 2) Get featured properties
SELECT id, title, slug, short_description, images, pricing_total_value, pricing_expected_roi,
       tokenization_total_tokens, tokenization_available_tokens
FROM properties
WHERE is_active = TRUE AND is_featured = TRUE
ORDER BY sort_order ASC, created_at DESC
LIMIT 6;

-- 3) Property by slug
-- Param: $1=slug
SELECT * FROM properties WHERE slug = $1 AND is_active = TRUE;

-- 4) Portfolio summary
-- Param: $1=user_id
SELECT
  COUNT(*) FILTER (WHERE status = 'active') AS total_investments,
  COALESCE(SUM(investment_amount) FILTER (WHERE status = 'active'), 0) AS total_invested,
  COALESCE(SUM(tokens_purchased) FILTER (WHERE status = 'active'), 0) AS total_tokens,
  COALESCE(SUM(total_earned) FILTER (WHERE status = 'active'), 0) AS total_returns
FROM investments
WHERE user_id = $1;

-- 5) Holdings list
-- Param: $1=user_id
SELECT i.property_id, p.title AS property_title, i.tokens_purchased AS tokens, i.investment_amount AS invested,
       i.total_earned AS returns, p.status AS property_status
FROM investments i
JOIN properties p ON p.id = i.property_id
WHERE i.user_id = $1 AND i.status = 'active'
ORDER BY i.created_at DESC;

-- 6) Transactional Buy Tokens procedure (SQL script block)
-- Params: $1=user_id, $2=property_id, $3=tokens, $4=price_per_token
-- Executes in a transaction on backend using pg client
-- BEGIN; -- <wrap in backend>
-- Lock the row to prevent race conditions
UPDATE properties SET tokenization_available_tokens = tokenization_available_tokens
WHERE id = $2 FOR UPDATE;

-- Check availability
WITH avail AS (
  SELECT tokenization_available_tokens AS available FROM properties WHERE id = $2
)
SELECT CASE WHEN (SELECT available FROM avail) >= $3 THEN 1 ELSE 0 END AS ok;

-- Create investment
INSERT INTO investments (
  user_id, property_id, investment_amount, tokens_purchased, price_per_token,
  payment_method, payment_status, status, confirmed_at, activated_at
) VALUES (
  $1, $2, ($3 * $4), $3, $4, 'bank_transfer', 'completed', 'active', NOW(), NOW()
) RETURNING id;

-- Decrement availability
UPDATE properties
SET tokenization_available_tokens = tokenization_available_tokens - $3
WHERE id = $2;
-- COMMIT; -- <wrap in backend>


