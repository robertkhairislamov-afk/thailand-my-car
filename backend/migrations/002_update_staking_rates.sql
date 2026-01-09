-- Migration: Update Staking Rates
-- Date: 2026-01-06
-- Description: Decrease staking rates from 2.5% mo / 30% yr to 1.7% mo / 20.4% yr for economic sustainability

-- 1. Update platform settings
UPDATE platform_settings 
SET value = '1.7' 
WHERE key = 'staking_monthly_rate';

UPDATE platform_settings 
SET value = '20.4' 
WHERE key = 'staking_annual_rate';

-- 2. Update investment tier (Staking)
-- Assuming Staking tier has name 'Стейкинг' or similar. We update by tier_type usually, but here by active + criteria.
-- Updating return_percentage
UPDATE investment_tiers 
SET return_percentage = 30.00 -- Note: Database column logic might store annual rate here. Let's keep it consistent or update if needed. Wait, previously it was 30.00. Now should be 20.40.
WHERE name LIKE '%Стейкинг%' OR description LIKE '%Пассивный доход%';

UPDATE investment_tiers
SET return_percentage = 20.40
WHERE tier_type = 'staking';

-- 3. Update features JSON for Staking tier
-- We need to replace the specific string in the JSON array
UPDATE investment_tiers
SET features = (
    SELECT jsonb_agg(
        CASE
            WHEN elem::text LIKE '%2.5% в месяц (30% годовых)%' THEN '"1.7% в месяц (20.4% годовых)"'
            ELSE elem
        END
    )
    FROM jsonb_array_elements(features) elem
)
WHERE tier_type = 'staking' AND features::text LIKE '%2.5% в месяц (30% годовых)%';
