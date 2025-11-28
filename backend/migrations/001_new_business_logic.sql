-- Migration: New Business Logic
-- Date: 2025-11-27
-- Description: Update schema for staking model and investor choice

-- 1. Create platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO platform_settings (key, value, description) VALUES
  ('platform_wallet', '0x4182426adacc77effdf7f16fea939d49733e3409', 'Кошелёк для приёма платежей'),
  ('staking_monthly_rate', '2.5', 'Процент стейкинга в месяц'),
  ('staking_annual_rate', '30', 'Годовой процент стейкинга'),
  ('large_investor_return', '20', 'Возврат для крупных инвесторов через 6 мес (%)'),
  ('early_withdrawal_fee', '5', 'Комиссия за досрочный вывод до 6 мес (%)'),
  ('min_staking_investment_usd', '1000', 'Минимальная сумма для стейкинга (USD)'),
  ('min_car_investment_usd', '12400', 'Минимальная сумма для участия в авто (USD)'),
  ('total_cars_available', '9', 'Всего авто доступно'),
  ('exchange_rate_thb_usd', '32.65', 'Курс THB к USD')
ON CONFLICT (key) DO NOTHING;

-- 2. Update investment_tiers - deactivate old tiers and create new ones
UPDATE investment_tiers SET is_active = false WHERE id IN (1, 2);

-- New Tier 1: Стейкинг (for investors $1000 - $12,399)
INSERT INTO investment_tiers (name, description, min_investment_baht, min_investment_usd, duration_months, return_percentage, features, is_active)
VALUES (
  'Стейкинг',
  'Пассивный доход с гибкими условиями вывода',
  32650.00,
  1000.00,
  6,
  30.00,
  '["2.5% в месяц (30% годовых)", "Вывод в любой момент", "5% комиссия при выводе до 6 мес", "Ежемесячное начисление процентов"]'::jsonb,
  true
);

-- New Tier 2: Доля в авто (for investors $12,400+)
INSERT INTO investment_tiers (name, description, min_investment_baht, min_investment_usd, duration_months, return_percentage, features, is_active)
VALUES (
  'Доля в автомобиле',
  'Получите автомобиль в собственность или гарантированный возврат',
  404600.00,
  12400.00,
  6,
  20.00,
  '["Через 6 мес: +20% возврат ИЛИ ждать авто", "Автомобиль в собственность после выплаты кредита", "Приоритет: кто первый - тот получает авто", "Можно изменить выбор до закрытия кредита"]'::jsonb,
  true
);

-- 3. Add new columns to investments table
ALTER TABLE investments
  ADD COLUMN IF NOT EXISTS tier_type VARCHAR(20) DEFAULT 'staking',
  ADD COLUMN IF NOT EXISTS investor_choice VARCHAR(20) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS choice_made_at TIMESTAMP DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS staking_earned NUMERIC(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_staking_calc TIMESTAMP DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS early_withdrawal_fee NUMERIC(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS car_assigned BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS car_number INTEGER DEFAULT NULL;

-- Add comments for clarity
COMMENT ON COLUMN investments.tier_type IS 'staking or car_share';
COMMENT ON COLUMN investments.investor_choice IS 'take_profit or wait_for_car (for car_share tier after 6 months)';
COMMENT ON COLUMN investments.staking_earned IS 'Total staking earnings accumulated';
COMMENT ON COLUMN investments.early_withdrawal_fee IS 'Fee charged for early withdrawal (before 6 months)';
COMMENT ON COLUMN investments.car_assigned IS 'Whether a car has been assigned to this investor';
COMMENT ON COLUMN investments.car_number IS 'Which car (1-9) assigned to investor';

-- 4. Create table for car assignments tracking
CREATE TABLE IF NOT EXISTS car_assignments (
  id SERIAL PRIMARY KEY,
  car_number INTEGER NOT NULL CHECK (car_number >= 1 AND car_number <= 9),
  investment_id UUID REFERENCES investments(id),
  wallet_address VARCHAR(42) NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'reserved',
  loan_paid_off BOOLEAN DEFAULT FALSE,
  ownership_transferred_at TIMESTAMP DEFAULT NULL,
  UNIQUE(car_number)
);

COMMENT ON TABLE car_assignments IS 'Tracks which cars are assigned to which investors (first come first served)';

-- 5. Create table for staking transactions log
CREATE TABLE IF NOT EXISTS staking_log (
  id SERIAL PRIMARY KEY,
  investment_id UUID REFERENCES investments(id),
  type VARCHAR(20) NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  rate_applied NUMERIC(5,2),
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

COMMENT ON TABLE staking_log IS 'Log of all staking calculations and withdrawals';

-- 6. Drop NFT column (no longer needed)
ALTER TABLE investments DROP COLUMN IF EXISTS nft_token_id;

-- 7. Create index for tier_type
CREATE INDEX IF NOT EXISTS idx_investments_tier_type ON investments(tier_type);
CREATE INDEX IF NOT EXISTS idx_investments_car_assigned ON investments(car_assigned);
