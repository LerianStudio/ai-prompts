#!/bin/bash

# Clear all tasks from the board database
# Usage: ./scripts/clear-all-tasks.sh

set -e

SERVICE_URL="http://localhost:3020"

echo "🗑️  Clearing all tasks from board database..."

# Check if service is running
if ! curl -sf "$SERVICE_URL/health" > /dev/null; then
    echo "❌ Error: Task service is not running at $SERVICE_URL"
    echo "   Please start the service first:"
    echo "   ./scripts/start-task-service.sh --background"
    exit 1
fi

# Get all tasks
echo "📋 Fetching current tasks..."
TASKS=$(curl -s "$SERVICE_URL/api/tasks")

# Extract task IDs and delete each one
echo "$TASKS" | jq -r '.[].id' | while read -r task_id; do
    echo "   Deleting task: $task_id"
    curl -s -X DELETE "$SERVICE_URL/api/tasks/$task_id" > /dev/null
done

# Verify all tasks are deleted
REMAINING=$(curl -s "$SERVICE_URL/api/tasks" | jq length)
echo "✅ Done! Remaining tasks: $REMAINING"

if [ "$REMAINING" -eq 0 ]; then
    echo "🎉 All tasks successfully deleted!"
else
    echo "⚠️  Warning: $REMAINING tasks still remain"
fi