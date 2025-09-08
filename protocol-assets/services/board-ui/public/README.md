# Task Management Web UI

A modern, responsive web interface for the Task Management System.

## Features

### Dashboard View
- **Kanban Board Layout**: Tasks organized in three columns:
  - **Pending**: Newly created tasks
  - **In Progress**: Tasks currently being worked on
  - **Completed**: Finished tasks

- **Task Cards**: Show title, description preview, and progress indicators
- **Real-time Updates**: Automatically refreshes every 30 seconds
- **Task Counters**: Display number of tasks in each status

### Task Management
- **Create New Tasks**: Click "New Task" to create tasks with:
  - Title (required)
  - Description (optional)
  - Todo items (optional, one per line)

- **Task Details**: Click any task card to view:
  - Full task information
  - Todo list with checkboxes
  - Progress bar showing completion percentage
  - Status change dropdown

### Interactive Features
- **Complete Todos**: Click checkbox to mark todos as complete
- **Update Status**: Use dropdown to change task status
- **Progress Tracking**: Visual progress bars show completion percentage
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## Usage

1. **Access the UI**: Navigate to http://localhost:3020 in your web browser
2. **Create Tasks**: Click "New Task" button and fill in the form
3. **Manage Tasks**: Click task cards to view details and manage todos
4. **Track Progress**: Watch the progress bars and status columns update

## Keyboard Shortcuts
- `Escape`: Close modals or return to dashboard
- `Tab`/`Shift+Tab`: Navigate through form fields

## API Integration
The UI automatically connects to the REST API running on the same port and provides:
- Real-time task synchronization
- Error handling with user-friendly notifications
- Optimistic updates for better user experience

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- JavaScript must be enabled