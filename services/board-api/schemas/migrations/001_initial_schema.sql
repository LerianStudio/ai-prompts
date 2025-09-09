-- Initial schema for task management system
-- Based on vibe-kanban patterns but simplified for lerian-protocol needs

PRAGMA foreign_keys = ON;

-- Tasks table - main task entities
CREATE TABLE tasks (
    id          TEXT PRIMARY KEY,
    project_id  TEXT NOT NULL DEFAULT 'lerian-protocol',
    title       TEXT NOT NULL,
    description TEXT,
    status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    created_at  TEXT NOT NULL DEFAULT (datetime('now', 'subsec')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now', 'subsec'))
);

-- Todos table - individual todo items within tasks
CREATE TABLE todos (
    id          TEXT PRIMARY KEY,
    task_id     TEXT NOT NULL,
    content     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'completed')),
    sort_order  INTEGER NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now', 'subsec')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now', 'subsec')),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_todos_task_id ON todos(task_id);
CREATE INDEX idx_todos_status ON todos(status);
CREATE INDEX idx_todos_sort_order ON todos(task_id, sort_order);