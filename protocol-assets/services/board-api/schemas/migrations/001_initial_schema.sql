-- Initial schema for task management system (PostgreSQL)
-- Based on vibe-kanban patterns but simplified for lerian-protocol needs
-- Includes all fields from previous SQLite migrations

-- Tasks table - main task entities
CREATE TABLE IF NOT EXISTS tasks (
    id                      TEXT PRIMARY KEY,
    project_id              TEXT NOT NULL DEFAULT 'lerian-protocol',
    title                   TEXT NOT NULL,
    description             TEXT,
    status                  TEXT NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'in_progress', 'code_review', 'completed', 'failed', 'blocked', 'waiting')),
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    workflow_id             TEXT,
    step_id                 TEXT,
    agent_type              TEXT DEFAULT 'claude-code',
    priority                INTEGER DEFAULT 0,
    estimated_duration      INTEGER,
    assignee                TEXT,
    claimed_at              TIMESTAMP WITH TIME ZONE,
    agent_prompt            TEXT,
    execution_status        TEXT CHECK (execution_status IN ('none', 'queued', 'running', 'completed', 'failed')),
    execution_log           TEXT,
    execution_started_at    TIMESTAMP WITH TIME ZONE,
    execution_completed_at  TIMESTAMP WITH TIME ZONE
);

-- Todos table - individual todo items within tasks
CREATE TABLE IF NOT EXISTS todos (
    id          TEXT PRIMARY KEY,
    task_id     TEXT NOT NULL,
    content     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'completed')),
    sort_order  INTEGER NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_workflow_id ON tasks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_tasks_step_id ON tasks(step_id);
CREATE INDEX IF NOT EXISTS idx_tasks_agent_type ON tasks(agent_type);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_execution_status ON tasks(execution_status);
CREATE INDEX IF NOT EXISTS idx_tasks_workflow_agent ON tasks(workflow_id, agent_type, status);
CREATE INDEX IF NOT EXISTS idx_todos_task_id ON todos(task_id);
CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
CREATE INDEX IF NOT EXISTS idx_todos_sort_order ON todos(task_id, sort_order);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();