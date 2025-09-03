# Directory: lib/board-service

## Purpose

`@lerian-protocol/board-service` is a full-stack task management service that provides both a REST API backend and a modern React frontend for the Lerian Protocol. It replaces the legacy file-based board system with a real-time, database-backed kanban board interface supporting drag-and-drop task management and live collaboration features.

## Architecture Overview

The system follows a **full-stack monorepo architecture** with clear separation between client and server:

- **Backend Server**: Express.js REST API with SQLite database and WebSocket support
- **Frontend Client**: React TypeScript application with Vite build system
- **Real-time Communication**: WebSocket integration for live updates
- **Database Layer**: SQLite with migration system and transaction support
- **Build System**: Concurrent development with production bundling

### Key Architectural Decisions

- **Monorepo Structure**: Single package containing both client and server
- **Database-First Design**: SQLite with proper foreign keys and constraints
- **Real-time by Default**: WebSocket integration for instant collaboration
- **Component Architecture**: shadcn/ui components with custom Kanban implementation
- **Modern Tooling**: Vite for fast development, TypeScript for type safety

## Key Components

### Server Components

#### server.js (Application Server)

- **Purpose**: Main Express application with WebSocket server
- **Dependencies**: express, cors, ws, SQLite, TaskService
- **Used By**: Production deployment, development server
- **Key Patterns**: Class-based server, middleware composition, WebSocket broadcasting

**Core Features**:
- REST API endpoints (`/api/tasks/*`)
- WebSocket server for real-time updates
- Static file serving for production
- Request logging and error handling
- Database transaction support

#### TaskService (Business Logic)

- **Purpose**: Core business logic for task and todo management
- **Dependencies**: DatabaseManager, crypto (for UUIDs)
- **Used By**: server.js API routes
- **Key Patterns**: Service layer, transaction management, auto-status updates

**Core Operations**:
- CRUD operations for tasks and todos
- Automatic task completion when all todos are done
- Status transitions (pending → in_progress → completed)
- Field mapping between database and frontend expectations

#### DatabaseManager (Data Layer)

- **Purpose**: SQLite database abstraction with migration support
- **Dependencies**: sqlite3, fs (for migrations)
- **Used By**: TaskService
- **Key Patterns**: Repository pattern, migration system, connection pooling

**Database Features**:
- Automatic schema migrations
- Transaction support with rollback
- WAL mode for better concurrency
- Foreign key constraints enforcement

### Client Components

#### App.tsx (Main Application)

- **Purpose**: Root React component with WebSocket integration
- **Dependencies**: React hooks, custom hooks (useTasks)
- **Used By**: main.tsx as application entry point
- **Key Patterns**: Real-time state management, error boundaries, WebSocket lifecycle

**Core Features**:
- WebSocket connection with auto-reconnect
- Global error handling and loading states
- Real-time task synchronization
- Responsive layout with status indicators

#### KanbanBoard (UI Core)

- **Purpose**: Main kanban interface with drag-and-drop functionality
- **Dependencies**: @dnd-kit/core, custom components
- **Used By**: App.tsx as primary view
- **Key Patterns**: Drag and drop, column-based layout, modal management

**Kanban Features**:
- Three-column layout (Pending, In Progress, Completed)
- Drag-and-drop between columns
- Task creation and editing dialogs
- Real-time updates across all clients

#### useTasks Hook (State Management)

- **Purpose**: Centralized task state management and API integration
- **Dependencies**: React hooks, API client
- **Used By**: App.tsx and other components
- **Key Patterns**: Custom hooks, optimistic updates, error handling

**State Management**:
- CRUD operations with local state updates
- Error handling with user feedback
- Loading states for better UX
- Automatic refetching for real-time sync

## Design Patterns

- **Full-Stack Monorepo**: Single package with coordinated client/server development
- **Service Layer Architecture**: Clear separation between API, business logic, and data layers
- **Real-time First**: WebSocket integration as a core feature, not an addon
- **Component Composition**: Reusable UI components with shadcn/ui foundation
- **Custom Hooks Pattern**: React state management with reusable business logic
- **Transaction Management**: Database operations with proper ACID properties
- **Migration System**: Version-controlled database schema evolution

## Dependencies

### Server Dependencies

- **express**: ^4.18.0 - Web application framework
- **cors**: ^2.8.5 - Cross-origin resource sharing
- **ws**: ^8.18.3 - WebSocket server implementation
- **sqlite3**: ^5.1.0 - SQLite database driver
- **uuid**: ^9.0.0 - UUID generation for unique IDs

### Client Dependencies

- **react**: ^19.1.1 - UI library
- **@dnd-kit/core**: ^6.3.1 - Drag and drop functionality
- **@radix-ui/***: Various versions - Accessible UI primitives
- **lucide-react**: ^0.542.0 - Icon library
- **tailwindcss**: ^4.1.12 - Utility-first CSS framework

### Development Tools

- **vite**: ^7.1.4 - Fast build tool and dev server
- **typescript**: ^5.9.2 - Type safety
- **concurrently**: ^9.2.1 - Run client and server simultaneously

## Data Flow

### Task Creation Flow
1. User creates task in React UI → API call to `/api/tasks`
2. Server validates and stores in SQLite → Returns task with ID
3. WebSocket broadcast to all clients → Real-time UI updates

### Task Status Updates
1. Drag task between columns → Status update API call
2. Database transaction updates task and checks todo completion
3. Auto-status updates based on todo progress
4. WebSocket broadcast → All clients receive instant updates

### Real-time Synchronization
1. WebSocket connection established on app load
2. Server broadcasts events (task_created, task_updated, task_deleted)
3. Clients automatically refetch data on events
4. Optimistic updates for better UX

## Configuration

### Server Configuration
- **PORT**: Environment variable (default: 3020)
- **HOST**: Environment variable (default: localhost)
- **DB_PATH**: SQLite database path (default: `../../.claude/data/databases/task-management.db`)
- **NODE_ENV**: Environment mode (development/production)

### Development Configuration
- **Vite Dev Server**: Runs on port 5173 with API proxy
- **Concurrent Development**: Both servers run simultaneously
- **Hot Module Replacement**: Instant client-side updates

### Build Configuration
- **Client Build**: TypeScript compilation + Vite bundling
- **Static Serving**: Express serves built React app in production
- **Asset Optimization**: CSS/JS minification and bundling

## Testing Strategy

### Server Testing
- **Unit Tests**: Service layer business logic
- **Integration Tests**: API endpoints with test database
- **Database Tests**: Migration and transaction integrity

### Client Testing
- **Component Tests**: React component behavior
- **Hook Tests**: Custom hook logic and state management
- **E2E Tests**: Full user workflows with real API

### Test Coverage
- Service layer: Business logic and edge cases
- API endpoints: CRUD operations and error handling  
- UI components: User interactions and state updates

## Common Tasks

### Adding a New Task Field

1. Add column to database migration
2. Update TaskService to handle new field
3. Update TypeScript types in `src/client/types/`
4. Modify API endpoints to accept/return new field
5. Update React components to display/edit field

### Creating New Task Status

1. Update database CHECK constraint for valid statuses
2. Modify TaskService status validation logic
3. Add new column to kanban board
4. Update drag-and-drop logic for new status
5. Add appropriate UI styling and icons

### Adding Real-time Features

1. Define new WebSocket event types in server
2. Add broadcast calls in relevant API endpoints
3. Update client WebSocket message handling
4. Implement optimistic updates in React components
5. Test cross-client synchronization

## Gotchas and Tips

- ⚠️ **Database Path**: Ensure `.claude` directory exists for default DB path
- ⚠️ **Port Conflicts**: Server runs on 3020, Vite dev server on 5173
- ⚠️ **WebSocket Disconnects**: Client implements auto-reconnect logic
- ⚠️ **Transaction Deadlocks**: Use proper transaction ordering in concurrent operations
- ⚠️ **CORS Issues**: Configured for localhost development, update for production domains
- 💡 **Concurrent Development**: Use `npm run dev` to start both client and server
- 💡 **Database Inspection**: Use SQLite CLI to inspect database directly
- 💡 **WebSocket Testing**: Browser dev tools Network tab shows WebSocket messages
- 💡 **Hot Reload**: Vite provides instant updates for client, nodemon for server
- 💡 **Component Library**: All UI components are customizable via shadcn/ui patterns

## Performance Considerations

- **SQLite Optimizations**: WAL mode, proper indexes, foreign key constraints
- **WebSocket Efficiency**: Message broadcasting only to connected clients
- **Client Bundle Size**: Tree-shaking with Vite, code splitting for large components
- **Real-time Updates**: Debounced API calls and optimistic updates
- **Database Connections**: Connection pooling and proper cleanup
- **Asset Serving**: Static file caching in production mode

## Security Considerations

- **SQL Injection Prevention**: Parameterized queries throughout
- **CORS Configuration**: Proper origin validation for production
- **Input Validation**: Server-side validation for all API endpoints
- **WebSocket Security**: Connection validation and message sanitization
- **Database Security**: Foreign key constraints and data integrity
- **File System Security**: Restricted database file permissions

## Future Improvements

- [ ] Add user authentication and authorization system
- [ ] Implement task assignment and team collaboration features
- [ ] Add real-time notifications and activity feeds  
- [ ] Enhance filtering, search, and project organization
- [ ] Add task templates and workflow automation
- [ ] Implement data export/import capabilities
- [ ] Add mobile-responsive PWA features
- [ ] Integrate with external tools (GitHub, Slack, etc.)

## Related Documentation

- Task Management API specification
- Database schema and migration guide  
- WebSocket protocol documentation
- Component library usage guide
- Deployment and scaling guide

## Development Workflow

### Starting Development

```bash
# Install dependencies
npm install

# Start both client and server
npm run dev

# Access app at http://localhost:5173
# API available at http://localhost:3020
```

### Building for Production

```bash
# Build client assets
npm run client:build

# Build CSS for production  
npm run build:css:prod

# Start production server
npm start
```

### Database Operations

```bash
# Run migrations manually
npm run migrate

# Access SQLite CLI
sqlite3 .claude/task-management.db

# View current schema
.schema
```

### Testing

```bash
# Run server tests
npm test

# Test API endpoints
curl http://localhost:3020/health
curl http://localhost:3020/api/tasks
```

## Architecture Benefits

1. **Unified Development**: Single repo with coordinated client/server changes
2. **Real-time Collaboration**: Instant updates across all connected clients  
3. **Type Safety**: End-to-end TypeScript with shared type definitions
4. **Modern Tooling**: Fast development with Vite and hot module replacement
5. **Scalable Database**: SQLite with proper schema design and migrations
6. **Component Reusability**: shadcn/ui foundation with custom extensions
7. **Production Ready**: Optimized builds with static file serving