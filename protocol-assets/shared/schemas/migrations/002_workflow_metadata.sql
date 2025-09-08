-- Add workflow-specific fields to tasks table for kanban workflow orchestration
-- This enables dependency tracking and agent assignment capabilities

PRAGMA foreign_keys = ON;

-- Add workflow metadata columns to tasks table
ALTER TABLE tasks ADD COLUMN workflow_id TEXT;

ALTER TABLE tasks ADD COLUMN step_id TEXT;

ALTER TABLE tasks ADD COLUMN agent_type TEXT;

ALTER TABLE tasks ADD COLUMN priority INTEGER DEFAULT 0;

ALTER TABLE tasks ADD COLUMN estimated_duration INTEGER;

ALTER TABLE tasks ADD COLUMN assignee TEXT;

ALTER TABLE tasks ADD COLUMN claimed_at TEXT;

-- Create dependencies table for workflow task relationships
CREATE TABLE task_dependencies (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    depends_on_task_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'subsec')),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE(task_id, depends_on_task_id)
);

-- Indexes for new workflow fields
CREATE INDEX idx_tasks_workflow_id ON tasks(workflow_id);

CREATE INDEX idx_tasks_step_id ON tasks(step_id);

CREATE INDEX idx_tasks_agent_type ON tasks(agent_type);

CREATE INDEX idx_tasks_priority ON tasks(priority);

CREATE INDEX idx_tasks_assignee ON tasks(assignee);

CREATE INDEX idx_tasks_workflow_agent ON tasks(workflow_id, agent_type, status);

CREATE INDEX idx_task_dependencies_task_id ON task_dependencies(task_id);

CREATE INDEX idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);