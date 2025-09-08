-- Update tasks table status constraint to include new workflow statuses
-- SQLite doesn't support ALTER COLUMN, so we need to recreate the table

PRAGMA foreign_keys = OFF;

-- Drop the view that depends on tasks table
DROP VIEW IF EXISTS tasks_with_dependencies;

-- Create new tasks table with updated constraint
CREATE TABLE tasks_new (
    id          TEXT PRIMARY KEY,
    project_id  TEXT NOT NULL DEFAULT 'lerian-protocol',
    title       TEXT NOT NULL,
    description TEXT,
    status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'blocked', 'waiting')),
    created_at  TEXT NOT NULL DEFAULT (datetime('now', 'subsec')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now', 'subsec')),
    workflow_id TEXT,
    step_id TEXT,
    agent_type TEXT,
    priority INTEGER DEFAULT 0,
    estimated_duration INTEGER,
    assignee TEXT,
    claimed_at TEXT
);

-- Copy data from old table
INSERT INTO tasks_new SELECT 
    id, project_id, title, description, status, created_at, updated_at,
    workflow_id, step_id, agent_type, priority, estimated_duration, assignee, claimed_at
FROM tasks;

-- Drop old table and rename new one
DROP TABLE tasks;
ALTER TABLE tasks_new RENAME TO tasks;

-- Recreate indexes
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_workflow_id ON tasks(workflow_id);
CREATE INDEX idx_tasks_step_id ON tasks(step_id);
CREATE INDEX idx_tasks_agent_type ON tasks(agent_type);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_assignee ON tasks(assignee);
CREATE INDEX idx_tasks_workflow_agent ON tasks(workflow_id, agent_type, status);

-- Recreate the tasks_with_dependencies view
CREATE VIEW tasks_with_dependencies AS
SELECT 
    t.*,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM task_dependencies td 
            JOIN tasks dep ON td.depends_on_task_id = dep.id 
            WHERE td.task_id = t.id AND dep.status NOT IN ('completed', 'failed')
        ) THEN 1 
        ELSE 0 
    END as has_pending_dependencies,
    (SELECT COUNT(*) FROM task_dependencies WHERE task_id = t.id) as total_dependencies,
    (SELECT COUNT(*) FROM task_dependencies td JOIN tasks dep ON td.depends_on_task_id = dep.id WHERE td.task_id = t.id AND dep.status = 'completed') as completed_dependencies
FROM tasks t;

PRAGMA foreign_keys = ON;