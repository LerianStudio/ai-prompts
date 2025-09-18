-- Add Claude Code integration fields to tasks table
-- Migration 002: Claude Code Integration Support

-- Add claude_session_id field for session management
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS claude_session_id TEXT;

-- Add subscription tracking fields
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subscription_status TEXT
    CHECK (subscription_status IS NULL OR subscription_status IN ('subscription', 'api_key', 'unknown'));

-- Add execution metadata
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS execution_metadata JSONB;

-- Update execution_status to include new states
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_execution_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_execution_status_check
    CHECK (execution_status IN ('none', 'queued', 'running', 'completed', 'failed', 'cancelled'));

-- Create index for claude session lookups
CREATE INDEX IF NOT EXISTS idx_tasks_claude_session_id ON tasks(claude_session_id)
WHERE claude_session_id IS NOT NULL;

-- Create index for subscription status analysis
CREATE INDEX IF NOT EXISTS idx_tasks_subscription_status ON tasks(subscription_status)
WHERE subscription_status IS NOT NULL;

-- Create index for execution metadata queries
CREATE INDEX IF NOT EXISTS idx_tasks_execution_metadata ON tasks USING GIN (execution_metadata)
WHERE execution_metadata IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN tasks.claude_session_id IS 'Claude Code session ID for conversation continuity';
COMMENT ON COLUMN tasks.subscription_status IS 'Authentication method used (subscription/api_key/unknown)';
COMMENT ON COLUMN tasks.execution_metadata IS 'Additional execution data (warnings, performance, etc.)';

-- Create view for active Claude Code sessions
CREATE OR REPLACE VIEW active_claude_sessions AS
SELECT
    claude_session_id,
    COUNT(*) as task_count,
    MAX(execution_started_at) as last_used,
    STRING_AGG(title, ', ' ORDER BY execution_started_at DESC) as recent_tasks
FROM tasks
WHERE claude_session_id IS NOT NULL
  AND execution_status IN ('running', 'completed')
GROUP BY claude_session_id;