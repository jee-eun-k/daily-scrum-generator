-- Daily Scrum Generator Database Setup
-- Execute these queries in your Supabase SQL editor

-- Create the LogCategory enum first
CREATE TYPE "LogCategory" AS ENUM ('DONE', 'TODO', 'BLOCKER', 'UPCOMING');

-- Create users table
CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create daily_logs table
CREATE TABLE "daily_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "date" DATE NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  CONSTRAINT "daily_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  
  -- Unique constraint for user_id + date
  CONSTRAINT "daily_logs_user_id_date_key" UNIQUE ("user_id", "date")
);

-- Create log_entries table
CREATE TABLE "log_entries" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "daily_log_id" UUID NOT NULL,
  "work_item_id" TEXT,
  "description" TEXT NOT NULL,
  "category" "LogCategory" NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  CONSTRAINT "log_entries_daily_log_id_fkey" FOREIGN KEY ("daily_log_id") REFERENCES "daily_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for better performance
CREATE INDEX "daily_logs_user_id_idx" ON "daily_logs"("user_id");
CREATE INDEX "daily_logs_date_idx" ON "daily_logs"("date");
CREATE INDEX "log_entries_daily_log_id_idx" ON "log_entries"("daily_log_id");
CREATE INDEX "log_entries_category_idx" ON "log_entries"("category");

-- Create trigger function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON "users" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_logs_updated_at 
    BEFORE UPDATE ON "daily_logs" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_log_entries_updated_at 
    BEFORE UPDATE ON "log_entries" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - you can remove this section if not needed)
-- Sample user
INSERT INTO "users" ("id") VALUES ('11111111-1111-1111-1111-111111111111');

-- Sample daily log for today
INSERT INTO "daily_logs" ("id", "user_id", "date") 
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', CURRENT_DATE);

-- Sample log entries
INSERT INTO "log_entries" ("daily_log_id", "description", "category", "order") VALUES
('22222222-2222-2222-2222-222222222222', 'Completed API integration', 'DONE', 0),
('22222222-2222-2222-2222-222222222222', 'Fixed database connection issue', 'DONE', 1),
('22222222-2222-2222-2222-222222222222', 'Implement user authentication', 'TODO', 0),
('22222222-2222-2222-2222-222222222222', 'Write unit tests', 'TODO', 1),
('22222222-2222-2222-2222-222222222222', 'Database performance issue', 'BLOCKER', 0),
('22222222-2222-2222-2222-222222222222', 'Plan next sprint features', 'UPCOMING', 0);