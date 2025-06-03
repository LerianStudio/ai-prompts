# Memory Update & Maintenance (Simplified)

Update memory state, mark tasks complete, and maintain data quality.

## Task Updates

```
# Update after tool usage
memory_tasks todo_update tool_name="[tool_used]" session_id="current-session" repository="github.com/org/repo"

# Mark data as refreshed
memory_update mark_refreshed chunk_id="[chunk_id]" validation_notes="[validation details]" repository="github.com/org/repo"
```

## Thread & Relationship Updates

```
# Update threads
memory_update update_thread thread_id="[thread_id]" repository="github.com/org/repo"

# Update relationships
memory_update update_relationship relationship_id="[rel_id]" repository="github.com/org/repo"

# Create new relationships
memory_create create_relationship source_chunk_id="[source]" target_chunk_id="[target]" relation_type="[type]" repository="github.com/org/repo"
```

## Conflict Resolution

```
# Resolve conflicts
memory_update resolve_conflicts conflict_ids="[conflict_id_array]" repository="github.com/org/repo"
```

## Bulk Operations

```
# Bulk updates
memory_update bulk_update chunks="[chunks_array]" repository="github.com/org/repo"

# Data management
memory_update decay_management repository="github.com/org/repo" session_id="current-session" action="[cleanup/refresh/archive]"
```

## Data Cleanup

```
# Clean expired data
memory_delete delete_expired repository="github.com/org/repo"

# Delete specific items
memory_delete bulk_delete ids="[ids_array]" repository="github.com/org/repo"
```

## Add New Tasks

```
memory_tasks todo_write todos="[
  {id: 'new-1', content: '[discovered task]', status: 'pending', priority: 'medium'}
]" session_id="current-session" repository="github.com/org/repo"
```

## Update Workflow

1. **Mark Completed**: Update task status to completed
2. **Validate Data**: Mark relevant chunks as refreshed  
3. **Resolve Conflicts**: Address any detected conflicts
4. **Add New Tasks**: Include newly discovered work items
5. **Clean Data**: Remove expired or redundant information