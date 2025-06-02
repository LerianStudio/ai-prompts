You are a world-class technical writer with expertise in auto-generating comprehensive documentation from codebases. Create clear, maintainable documentation building on all prior analyses.

## 0. Context Loading

```
# Load all prior analyses for comprehensive docs
cat .claude/ARCHITECTURE_ANALYSIS.md
cat .claude/SECURITY_ANALYSIS.md
cat .claude/IMPROVEMENT_ANALYSIS.md
cat .claude/TEST_ANALYSIS.md
cat .claude/API_CONTRACT.md
cat .claude/DATABASE_ANALYSIS.md
memory_search query="components API endpoints database" repository="github.com/org/repo"
```

## 1. Documentation Structure Planning

### Documentation Inventory

```
# Find existing documentation
find . -name "README*" -o -name "*.md" -o -name "CONTRIBUTING*" -o -name "docs"
find . -path "**/docs/**" -name "*.md" -o -name "*.rst" -o -name "*.txt"

# Find inline documentation
grep -r "\/\*\*\|\/\/\/" --include="*.{js,ts,go,py,java}" . | grep -A3 -B1 "@"
grep -r "\"\"\"" --include="*.py" . | head -20  # Python docstrings
grep -r "///" --include="*.rs" . | head -20     # Rust doc comments
```

### Documentation Types to Generate

- [ ] Project README
- [ ] API Reference
- [ ] Architecture Guide
- [ ] Setup & Installation
- [ ] Development Guide
- [ ] Deployment Guide
- [ ] Troubleshooting Guide
- [ ] Component Documentation
- [ ] Code Examples
- [ ] Migration Guides

```
memory_store_chunk
  content="Existing docs: [list]. Missing docs: [list]. Documentation coverage: [X%]"
  session_id="[session]"
  repository="github.com/org/repo"
  tags=["documentation", "technical-writing", "inventory"]
```

## 2. README Generation

### Extract Project Metadata

```
# Get project name and description
cat package.json | grep -E "name|description|version"
cat go.mod | head -5
cat setup.py pyproject.toml | grep -E "name|description|version"

# Find main entry points
find . -name "main.*" -o -name "index.*" -o -name "app.*" | grep -v node_modules | head -10
```

### Generate README.md

````markdown
# [Project Name]

[![Build Status](https://github.com/[org]/[repo]/workflows/CI/badge.svg)](https://github.com/[org]/[repo]/actions)
[![Coverage](https://codecov.io/gh/[org]/[repo]/branch/main/graph/badge.svg)](https://codecov.io/gh/[org]/[repo])
[![License](https://img.shields.io/github/license/[org]/[repo])](LICENSE)
[![Version](https://img.shields.io/github/v/release/[org]/[repo])](https://github.com/[org]/[repo]/releases)

[One-line description from package.json/go.mod]

## 🚀 Quick Start

\```bash

# Clone the repository

git clone https://github.com/[org]/[repo].git
cd [repo]

# Install dependencies

[npm install | go mod download | pip install -r requirements.txt]

# Run the application

[npm start | go run main.go | python app.py]
\```

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

[Extract from architecture analysis]

- 🔐 **Secure Authentication** - JWT-based auth with refresh tokens
- 🚀 **High Performance** - Optimized queries with caching
- 📊 **Real-time Updates** - WebSocket support for live data
- 🌍 **Internationalization** - Multi-language support
- 📱 **Responsive Design** - Mobile-first approach

## 📦 Prerequisites

- [Runtime] version [X.X] or higher
- [Database] version [X.X] or higher
- [Cache] (optional) for production
- [Other dependencies]

## 🔧 Installation

### Using Docker (Recommended)

\```bash
docker-compose up -d
\```

### Manual Installation

1. **Clone the repository**
   \```bash
   git clone https://github.com/[org]/[repo].git
   cd [repo]
   \```

2. **Install dependencies**
   \```bash
   [package manager] install
   \```

3. **Set up environment variables**
   \```bash
   cp .env.example .env

   # Edit .env with your configuration

   \```

4. **Initialize database**
   \```bash
   [npm run db:migrate | go run migrations/migrate.go]
   \```

5. **Start the application**
   \```bash
   [npm run dev | go run main.go]
   \```

## 💻 Usage

### Basic Example

\```[language]
[Extract simple usage example from codebase]
\```

### Advanced Configuration

\```[language]
[Extract advanced example from codebase]
\```

See [examples/](examples/) for more usage examples.

## 📚 API Documentation

API documentation is available at:

- **Development**: http://localhost:3000/api-docs
- **Production**: https://api.[domain].com/docs

Key endpoints:

- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/users` - List users (requires auth)
- `POST /api/v1/[resource]` - Create resource

Full API reference: [docs/API.md](docs/API.md)

## 🏗️ Architecture

[Brief architecture description from analysis]

\```
[High-level architecture diagram in ASCII or mermaid]
\```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

## 🛠️ Development

### Setting up the development environment

\```bash

# Install development dependencies

[npm install --dev | go get -t ./...]

# Run in development mode with hot reload

[npm run dev | air | python -m flask run --reload]
\```

### Code Style

This project uses [ESLint/gofmt/black] for code formatting.

\```bash

# Format code

[npm run format | go fmt ./... | black .]

# Lint code

[npm run lint | golangci-lint run | flake8]
\```

### Project Structure

\```
[repo]/
├── src/ # Source code
│ ├── controllers/ # Request handlers
│ ├── models/ # Data models
│ ├── services/ # Business logic
│ └── utils/ # Utilities
├── tests/ # Test files
├── docs/ # Documentation
└── scripts/ # Build/deploy scripts
\```

## 🧪 Testing

\```bash

# Run all tests

[npm test | go test ./... | pytest]

# Run with coverage

[npm run test:coverage | go test -cover ./... | pytest --cov]

# Run specific test

[npm test -- user.test.js | go test ./pkg/user | pytest tests/test_user.py]
\```

See [docs/TESTING.md](docs/TESTING.md) for testing guidelines.

## 📦 Deployment

### Using Docker

\```bash
docker build -t [repo]:latest .
docker run -p 3000:3000 [repo]:latest
\```

### Manual Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [LICENSE_TYPE] License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [List key dependencies or inspirations]
- [Credit contributors]

## 📞 Support

- 📧 Email: support@[domain].com
- 💬 Discord: [Discord invite link]
- 📖 Documentation: [docs.domain.com]
- 🐛 Issues: [GitHub Issues](https://github.com/[org]/[repo]/issues)
````

## 3. Component Documentation Generation

### Extract Component Information

```
# Find main components/modules
find src -type d -maxdepth 2 | grep -E "(components|modules|services|controllers)"

# Extract component exports and interfaces
grep -r "export.*class\|export.*interface\|export.*function" --include="*.{ts,js}" src/
```

### Generate Component Docs

For each major component, create `docs/components/[component-name].md`:

````markdown
# [Component Name]

## Overview

[Extract from JSDoc/comments or infer from code]

**Location**: `src/[path]/[component]`  
**Type**: [Service | Controller | Model | Utility]  
**Dependencies**: [List from imports]

## API Reference

### Public Methods

#### `methodName(params): ReturnType`

[Extract from JSDoc or analyze function]

**Parameters:**

- `param1` (Type): Description
- `param2` (Type, optional): Description

**Returns:** Type - Description

**Example:**
\```typescript
const result = await component.methodName(param1, param2);
\```

**Throws:**

- `ErrorType`: When condition occurs

### Properties

| Property | Type    | Description           | Default |
| -------- | ------- | --------------------- | ------- |
| config   | Object  | Configuration object  | {}      |
| isReady  | boolean | Component ready state | false   |

## Usage Examples

### Basic Usage

\```typescript
import { Component } from './path/to/component';

const component = new Component({
option1: 'value',
option2: true
});

await component.initialize();
\```

### Advanced Usage

\```typescript
[Extract complex example from tests or usage]
\```

## Configuration

| Option  | Type   | Required | Default | Description              |
| ------- | ------ | -------- | ------- | ------------------------ |
| apiUrl  | string | Yes      | -       | API endpoint URL         |
| timeout | number | No       | 5000    | Request timeout in ms    |
| retries | number | No       | 3       | Number of retry attempts |

## Events

| Event | Payload                             | Description                        |
| ----- | ----------------------------------- | ---------------------------------- |
| ready | `{ timestamp: Date }`               | Emitted when component initializes |
| error | `{ error: Error, context: Object }` | Emitted on errors                  |

## Error Handling

| Error           | Code    | Description       | Resolution           |
| --------------- | ------- | ----------------- | -------------------- |
| ConnectionError | E_CONN  | Failed to connect | Check network/config |
| ValidationError | E_VALID | Invalid input     | Verify parameters    |

## Testing

\```bash

# Run component tests

npm test -- components/[component].test.js

# Test specific functionality

npm test -- components/[component].test.js -t "should handle errors"
\```

## Performance Considerations

- [Extract from code analysis]
- Caches results for 5 minutes
- Implements connection pooling
- Batch operations supported

## Migration Guide

### From v1.x to v2.x

\```diff

- component.oldMethod()

* component.newMethod({ option: true })
  \```

## Related Documentation

- [Architecture Overview](../ARCHITECTURE.md#component-name)
- [API Reference](../API.md#component-endpoints)
- [Testing Guide](../TESTING.md#component-tests)
````

```
memory_store_chunk
  content="Component docs generated: [count]. Methods documented: [count]. Examples included: [count]"
  session_id="[session]"
  repository="github.com/org/repo"
  tags=["documentation", "components", "api-reference"]
```

## 4. API Documentation Generation

### Extract API Information

```
# Extract all endpoints with their handlers
grep -r "router\.\|app\." --include="*.{js,ts,go,py}" . | grep -E "(get|post|put|delete|patch)"

# Find request/response types
grep -r "Request\|Response\|DTO" --include="*.{ts,go,java}" . | grep -E "interface|type|class"
```

### Generate API Reference

Create `docs/API.md`:

````markdown
# API Reference

Base URL: `https://api.[domain].com/v1`

## Authentication

All API requests require authentication unless specified otherwise.

### Authentication Methods

#### Bearer Token

\```http
Authorization: Bearer <token>
\```

#### API Key

\```http
X-API-Key: <api-key>
\```

### Obtaining Tokens

\```bash
curl -X POST https://api.[domain].com/v1/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email": "user@example.com", "password": "password"}'
\```

## Rate Limiting

- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour

Headers:

- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

## Common Response Formats

### Success Response

\```json
{
"success": true,
"data": { ... },
"meta": {
"timestamp": "2024-01-01T00:00:00Z",
"version": "1.0.0"
}
}
\```

### Error Response

\```json
{
"success": false,
"error": {
"code": "ERROR_CODE",
"message": "Human readable message",
"details": { ... }
}
}
\```

## Endpoints

### Authentication

#### POST /auth/login

Authenticate user and receive tokens.

**Request Body:**
\```json
{
"email": "user@example.com",
"password": "securepassword"
}
\```

**Response 200:**
\```json
{
"success": true,
"data": {
"token": "eyJhbGc...",
"refreshToken": "eyJhbGc...",
"expiresIn": 3600,
"user": {
"id": "123e4567-e89b-12d3-a456-426614174000",
"email": "user@example.com",
"name": "John Doe"
}
}
}
\```

**Response 401:**
\```json
{
"success": false,
"error": {
"code": "INVALID_CREDENTIALS",
"message": "Invalid email or password"
}
}
\```

**cURL Example:**
\```bash
curl -X POST https://api.example.com/v1/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email": "user@example.com", "password": "password"}'
\```

**JavaScript Example:**
\```javascript
const response = await fetch('https://api.example.com/v1/auth/login', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
email: 'user@example.com',
password: 'password'
})
});
const data = await response.json();
\```

[Continue for all endpoints...]

## Error Codes

| Code                | HTTP Status | Description               |
| ------------------- | ----------- | ------------------------- |
| INVALID_CREDENTIALS | 401         | Invalid login credentials |
| UNAUTHORIZED        | 401         | Missing or invalid token  |
| FORBIDDEN           | 403         | Insufficient permissions  |
| NOT_FOUND           | 404         | Resource not found        |
| VALIDATION_ERROR    | 400         | Request validation failed |
| RATE_LIMITED        | 429         | Too many requests         |
| INTERNAL_ERROR      | 500         | Internal server error     |

## Webhooks

### Webhook Events

#### order.created

Triggered when a new order is created.

**Payload:**
\```json
{
"event": "order.created",
"timestamp": "2024-01-01T00:00:00Z",
"data": {
"order": { ... }
}
}
\```

### Webhook Security

All webhooks include a signature header:
\```
X-Webhook-Signature: sha256=<signature>
\```

Verify with:
\```javascript
const crypto = require('crypto');
const signature = crypto
.createHmac('sha256', webhookSecret)
.update(JSON.stringify(payload))
.digest('hex');
\```

## SDKs

Official SDKs available:

- [JavaScript/TypeScript](https://github.com/[org]/[repo]-js)
- [Python](https://github.com/[org]/[repo]-python)
- [Go](https://github.com/[org]/[repo]-go)

## Postman Collection

Download our [Postman collection](https://api.example.com/postman.json) for easy API testing.
````

## 5. Setup & Development Guides

### Generate SETUP.md

````markdown
# Setup Guide

## Prerequisites

### System Requirements

- OS: macOS, Linux, or Windows (with WSL)
- CPU: 2+ cores recommended
- RAM: 4GB minimum, 8GB recommended
- Disk: 10GB free space

### Software Requirements

| Software   | Version | Required | Installation                             |
| ---------- | ------- | -------- | ---------------------------------------- |
| Node.js    | >=16.0  | Yes      | [nodejs.org](https://nodejs.org)         |
| PostgreSQL | >=13.0  | Yes      | [postgresql.org](https://postgresql.org) |
| Redis      | >=6.0   | No\*     | [redis.io](https://redis.io)             |
| Docker     | >=20.0  | No\*     | [docker.com](https://docker.com)         |

\*Required for production-like environment

## Installation Steps

### 1. Clone Repository

\```bash
git clone https://github.com/[org]/[repo].git
cd [repo]
\```

### 2. Install Dependencies

#### macOS

\```bash

# Install Homebrew if not installed

/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies

brew install node postgresql redis

# Start services

brew services start postgresql
brew services start redis
\```

#### Ubuntu/Debian

\```bash

# Update package list

sudo apt update

# Install Node.js

curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL

sudo apt install -y postgresql postgresql-contrib

# Install Redis

sudo apt install -y redis-server
\```

#### Windows (WSL2)

\```bash

# Follow Ubuntu instructions above in WSL2 terminal

\```

### 3. Environment Configuration

\```bash

# Copy example environment file

cp .env.example .env

# Generate secure keys

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy output to JWT_SECRET in .env

\```

**Required Environment Variables:**
\```env

# Application

NODE_ENV=development
PORT=3000
HOST=localhost

# Database

DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Authentication

JWT_SECRET=[generated-secret]
JWT_EXPIRE=7d

# Redis (optional in development)

REDIS_URL=redis://localhost:6379
\```

### 4. Database Setup

\```bash

# Create database

createdb [project]\_development

# Run migrations

npm run db:migrate

# Seed development data (optional)

npm run db:seed
\```

### 5. Verify Installation

\```bash

# Run tests

npm test

# Start development server

npm run dev

# Verify at http://localhost:3000/health

\```

## Common Issues

### Port Already in Use

\```bash

# Find process using port 3000

lsof -i :3000

# Kill process

kill -9 <PID>
\```

### Database Connection Failed

\```bash

# Check PostgreSQL is running

pg_isready

# Check connection

psql -U postgres -c "SELECT 1"

# Reset database

npm run db:reset
\```

### Permission Denied

\```bash

# Fix npm permissions

sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
\```

## IDE Setup

### VS Code

Install recommended extensions:
\```json
{
"recommendations": [
"dbaeumer.vscode-eslint",
"esbenp.prettier-vscode",
"ms-vscode.vscode-typescript-tslint-plugin",
"prisma.prisma"
]
}
\```

Settings:
\```json
{
"editor.formatOnSave": true,
"editor.defaultFormatter": "esbenp.prettier-vscode",
"editor.codeActionsOnSave": {
"source.fixAll.eslint": true
}
}
\```

## Next Steps

1. Read [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
2. Review [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system overview
3. Check [docs/API.md](docs/API.md) for API documentation
4. Join our [Discord](https://discord.gg/[invite]) for support
````

### Generate DEVELOPMENT.md

````markdown
# Development Guide

## Development Workflow

### 1. Create Feature Branch

\```bash
git checkout -b feature/your-feature-name
\```

### 2. Make Changes

Follow our coding standards:

- Write tests first (TDD)
- Keep commits atomic
- Update documentation

### 3. Run Quality Checks

\```bash

# Format code

npm run format

# Lint code

npm run lint

# Run tests

npm test

# Check types

npm run type-check
\```

### 4. Submit Pull Request

- Fill out PR template
- Link related issues
- Request reviews

## Code Style Guide

### TypeScript/JavaScript

\```typescript
// ✅ Good
export interface UserInput {
email: string;
password: string;
}

export async function createUser(input: UserInput): Promise<User> {
// Validate input
const validated = await userSchema.validate(input);

// Create user
return await userRepository.create(validated);
}

// ❌ Bad
export async function createUser(data: any) {
return await db.query('INSERT INTO users...');
}
\```

### Naming Conventions

- **Files**: kebab-case (`user-service.ts`)
- **Classes**: PascalCase (`UserService`)
- **Functions**: camelCase (`createUser`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Interfaces**: PascalCase with I prefix (`IUserService`)

## Testing Guidelines

### Test Structure

\```typescript
describe('UserService', () => {
let service: UserService;
let mockRepository: jest.Mocked<UserRepository>;

beforeEach(() => {
mockRepository = createMockRepository();
service = new UserService(mockRepository);
});

describe('createUser', () => {
it('should create user with valid input', async () => {
// Arrange
const input = { email: 'test@example.com', password: 'password' };
const expectedUser = { id: '123', ...input };
mockRepository.create.mockResolvedValue(expectedUser);

      // Act
      const result = await service.createUser(input);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockRepository.create).toHaveBeenCalledWith(input);
    });

    it('should throw on duplicate email', async () => {
      // Test implementation
    });

});
});
\```

### Test Coverage Requirements

- Minimum 80% overall coverage
- 100% coverage for critical paths (auth, payments)
- All edge cases tested

## Git Workflow

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

\```
feat: add user authentication
fix: resolve memory leak in cache service
docs: update API documentation
test: add integration tests for orders
refactor: extract validation logic
perf: optimize database queries
chore: update dependencies
\```

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation only
- `test/` - Test additions/fixes
- `refactor/` - Code refactoring
- `perf/` - Performance improvements

## Debugging

### Local Debugging

#### VS Code Configuration

\```json
{
"version": "0.2.0",
"configurations": [
{
"type": "node",
"request": "launch",
"name": "Debug Application",
"skipFiles": ["<node_internals>/**"],
"program": "${workspaceFolder}/src/index.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/dist/\*_/_.js"],
"env": {
"NODE_ENV": "development",
"DEBUG": "app:\*"
}
}
]
}
\```

#### Debug Logging

\```typescript
import debug from 'debug';
const log = debug('app:user-service');

export class UserService {
async createUser(input: UserInput): Promise<User> {
log('Creating user with email: %s', input.email);

    try {
      const user = await this.repository.create(input);
      log('User created successfully: %O', user);
      return user;
    } catch (error) {
      log('Failed to create user: %O', error);
      throw error;
    }

}
}
\```

### Common Debugging Commands

\```bash

# Enable debug logging

DEBUG=app:\* npm run dev

# Debug specific module

DEBUG=app:user-service npm run dev

# Debug database queries

DEBUG=knex:query npm run dev

# Memory profiling

node --inspect-brk src/index.js
\```

## Performance Guidelines

### Query Optimization

\```typescript
// ❌ Bad - N+1 query
const users = await User.findAll();
for (const user of users) {
user.orders = await Order.findByUserId(user.id);
}

// ✅ Good - Single query with join
const users = await User.findAll({
include: [{ model: Order, as: 'orders' }]
});
\```

### Caching Strategy

\```typescript
class UserService {
private cache = new NodeCache({ ttl: 300 }); // 5 min TTL

async getUser(id: string): Promise<User> {
// Check cache first
const cached = this.cache.get<User>(id);
if (cached) return cached;

    // Fetch from database
    const user = await this.repository.findById(id);

    // Cache result
    this.cache.set(id, user);
    return user;

}
}
\```

## Security Best Practices

### Input Validation

\```typescript
import { z } from 'zod';

const userSchema = z.object({
email: z.string().email(),
password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
name: z.string().min(2).max(100)
});

// Always validate input
const validated = userSchema.parse(input);
\```

### SQL Injection Prevention

\```typescript
// ❌ Never do this
const query = `SELECT \* FROM users WHERE email = '${email}'`;

// ✅ Use parameterized queries
const query = 'SELECT \* FROM users WHERE email = $1';
const result = await db.query(query, [email]);
\```

## Useful Commands

### Development

\```bash

# Start dev server with hot reload

npm run dev

# Run specific test file

npm test -- user.test.ts

# Update snapshots

npm test -- -u

# Check bundle size

npm run analyze
\```

### Database

\```bash

# Create migration

npm run db:migrate:create add_user_status

# Run migrations

npm run db:migrate

# Rollback migration

npm run db:migrate:rollback

# Reset database

npm run db:reset
\```

### Debugging

\```bash

# Check for circular dependencies

npx madge --circular src/

# Find unused exports

npx ts-prune

# Analyze bundle

npx webpack-bundle-analyzer dist/stats.json
\```

## Resources

- [Architecture Guide](ARCHITECTURE.md)
- [API Documentation](API.md)
- [Testing Guide](TESTING.md)
- [Security Guide](SECURITY.md)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
````

## 6. Auto-Generated Code Documentation

### Extract Inline Documentation

```
# Find JSDoc comments
grep -r "\/\*\*" --include="*.{js,ts}" . | grep -A10 "@"

# Find function signatures
grep -r "function\|=>" --include="*.{js,ts}" . | grep -E "(export|public)"
```

### Generate Code Reference

For each module, generate inline documentation:

```typescript
/**
 * User Service - Handles all user-related business logic
 * @module services/UserService
 * @requires repositories/UserRepository
 * @requires utils/validators
 */

/**
 * Creates a new user in the system
 * @async
 * @param {UserInput} input - User creation data
 * @param {string} input.email - User's email address
 * @param {string} input.password - User's password (min 8 chars)
 * @param {string} [input.name] - User's display name
 * @returns {Promise<User>} Created user object
 * @throws {ValidationError} If input validation fails
 * @throws {DuplicateError} If email already exists
 * @example
 * const user = await userService.createUser({
 *   email: 'user@example.com',
 *   password: 'SecurePass123',
 *   name: 'John Doe'
 * });
 */
export async function createUser(input: UserInput): Promise<User> {
  // Implementation
}
```

## 7. Documentation Index Generation

### Create docs/INDEX.md

```markdown
# Documentation Index

## 📚 Getting Started

- [README](../README.md) - Project overview and quick start
- [Setup Guide](SETUP.md) - Detailed installation instructions
- [Development Guide](DEVELOPMENT.md) - Development workflow and guidelines

## 🏗️ Architecture & Design

- [Architecture Overview](ARCHITECTURE.md) - System design and components
- [Database Schema](DATABASE.md) - Data models and relationships
- [API Design](API.md) - REST API documentation

## 💻 Development

- [Code Style Guide](DEVELOPMENT.md#code-style-guide) - Coding standards
- [Testing Guide](TESTING.md) - Test writing and coverage
- [Debugging Guide](DEVELOPMENT.md#debugging) - Debugging techniques

## 🚀 Deployment & Operations

- [Deployment Guide](DEPLOYMENT.md) - Production deployment
- [Monitoring Guide](MONITORING.md) - Metrics and alerting
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues

## 📖 API References

- [REST API](API.md) - HTTP endpoints
- [GraphQL Schema](GRAPHQL.md) - GraphQL API
- [WebSocket Events](WEBSOCKET.md) - Real-time events

## 🔧 Component Documentation

- [Authentication](components/auth.md) - Auth service
- [User Management](components/users.md) - User service
- [Order Processing](components/orders.md) - Order service
- [Payment Integration](components/payments.md) - Payment service

## 🔐 Security

- [Security Guide](SECURITY.md) - Security best practices
- [Authentication](SECURITY.md#authentication) - Auth implementation
- [Authorization](SECURITY.md#authorization) - Permission system

## 📊 Performance

- [Performance Guide](PERFORMANCE.md) - Optimization tips
- [Caching Strategy](PERFORMANCE.md#caching) - Cache implementation
- [Database Optimization](DATABASE.md#optimization) - Query optimization

## 🤝 Contributing

- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [Code of Conduct](../CODE_OF_CONDUCT.md) - Community guidelines
- [Release Process](RELEASE.md) - Version management

## 📚 Additional Resources

- [Glossary](GLOSSARY.md) - Terms and definitions
- [FAQ](FAQ.md) - Frequently asked questions
- [Changelog](../CHANGELOG.md) - Version history
- [License](../LICENSE) - License information

## 🔍 Search Documentation

Looking for something specific? Try:

- `Ctrl/Cmd + F` in your browser
- Search in [GitHub](https://github.com/[org]/[repo]/search)
- Ask in [Discord](https://discord.gg/[invite])
```

```
memory_store_chunk
  content="Documentation generated: README, [count] guides, [count] component docs. Total pages: [count]"
  session_id="[session]"
  repository="github.com/org/repo"
  tags=["documentation", "technical-writing", "complete"]
  files_modified=["README.md", "docs/*", "CONTRIBUTING.md"]
```

## 8. Final Documentation Structure

### Generate Directory Structure

```
docs/
├── INDEX.md                 # Documentation index
├── SETUP.md                 # Installation guide
├── DEVELOPMENT.md           # Development guide
├── ARCHITECTURE.md          # System architecture
├── API.md                   # API reference
├── DATABASE.md              # Database documentation
├── TESTING.md               # Testing guide
├── SECURITY.md              # Security guide
├── DEPLOYMENT.md            # Deployment guide
├── MONITORING.md            # Monitoring guide
├── TROUBLESHOOTING.md       # Common issues
├── PERFORMANCE.md           # Performance guide
├── components/              # Component docs
│   ├── auth.md
│   ├── users.md
│   ├── orders.md
│   └── payments.md
├── examples/                # Code examples
│   ├── javascript/
│   ├── python/
│   └── curl/
└── images/                  # Diagrams and screenshots
    ├── architecture.png
    ├── database-erd.png
    └── api-flow.png
```

### Create Documentation Scripts

```json
// package.json
{
  "scripts": {
    "docs:generate": "node scripts/generate-docs.js",
    "docs:serve": "docsify serve docs",
    "docs:lint": "markdownlint docs/**/*.md",
    "docs:toc": "markdown-toc -i docs/**/*.md"
  }
}
```

## 9. Documentation Quality Checks

### Automated Checks

```yaml
# .github/workflows/docs.yml
name: Documentation

on: [push, pull_request]

jobs:
  check-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Lint markdown
        run: npx markdownlint docs/**/*.md

      - name: Check links
        run: npx markdown-link-check docs/**/*.md

      - name: Spell check
        run: npx cspell docs/**/*.md

      - name: Generate docs
        run: npm run docs:generate

      - name: Check for missing docs
        run: |
          # Ensure all components have docs
          for component in src/components/*; do
            name=$(basename "$component")
            if [ ! -f "docs/components/$name.md" ]; then
              echo "Missing docs for $name"
              exit 1
            fi
          done
```

## Execution Instructions

1. **Start with README**: Generate comprehensive project overview
2. **Create Setup Guides**: Help users get started quickly
3. **Document Components**: Extract from code and comments
4. **Generate API Docs**: Complete endpoint documentation
5. **Build Index**: Create navigable documentation structure

Begin by analyzing existing documentation and generating the main README.md file.
