# Community Service

## Overview

The **Community Service** is a core microservice in the HumanCare healthcare platform that provides a community wall functionality. It enables users (patients, caregivers, doctors) to create, read, update, and delete community posts. This service facilitates knowledge sharing, support discussions, advice exchange, and event announcements within the healthcare community.

The service is built with **Spring Boot** and **Java 17**, uses **MySQL** for data persistence, and integrates with the HumanCare ecosystem through **Eureka Service Discovery** and the **API Gateway**.

---

## Technology Stack

| Component | Version/Technology |
|-----------|-------------------|
| **Language** | Java 17 |
| **Framework** | Spring Boot 3.2.2 |
| **Spring Cloud** | 2023.0.0 |
| **Database** | MySQL 8.0 |
| **JPA Provider** | Hibernate (Spring Data JPA) |
| **Build Tool** | Maven 3.9 |
| **Container** | Docker (Eclipse Temurin 17 JRE) |
| **Service Discovery** | Netflix Eureka Client |
| **External Config** | Spring Cloud Config |

### Key Dependencies

- `spring-boot-starter-web` - REST API framework
- `spring-boot-starter-data-jpa` - JPA/Data access
- `spring-boot-starter-validation` - Bean validation (Jakarta Validation)
- `spring-boot-starter-actuator` - Health checks and metrics
- `spring-cloud-starter-netflix-eureka-client` - Service registration/discovery
- `spring-cloud-starter-config` - Externalized configuration
- `mysql-connector-j` - MySQL JDBC driver

---

## Service Configuration

| Property | Value |
|----------|-------|
| **Application Name** | `community-service` |
| **Port** | `8087` |
| **Eureka Registered** | ✅ Yes |
| **Container Name** | `hc-community-service` |
| **Base Path** | `/api/v1/posts` |
| **Database** | MySQL (`community_db`) |

### External Port Mapping

| Service | External Port | Internal Port |
|---------|--------------|---------------|
| Community Service | 8087 | 8087 |
| MySQL Community DB | 3311 | 3306 |

---

## API Endpoints

### Base URL

- **Direct Access:** `http://localhost:8087/api/v1/posts`
- **Via Gateway:** `http://localhost:8081/api/v1/posts`

### Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/v1/posts` | Get all posts (paginated, filterable) | Yes |
| `GET` | `/api/v1/posts/{id}` | Get a specific post by ID | Yes |
| `POST` | `/api/v1/posts` | Create a new community post | Yes |
| `PUT` | `/api/v1/posts/{id}` | Update an existing post | Yes |
| `DELETE` | `/api/v1/posts/{id}` | Delete a post | Yes |
| `GET` | `/actuator/health` | Health check endpoint | No |
| `GET` | `/actuator/info` | Service information | No |

---

### 1. Get All Posts

Retrieves a paginated list of community posts with optional filtering.

```http
GET /api/v1/posts?authorId={uuid}&category={category}&page={page}&size={size}&sort={sort}
```

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `authorId` | UUID | No | Filter posts by author ID |
| `category` | String | No | Filter by category (`GENERAL`, `SUPPORT`, `ADVICE`, `EVENT`) |
| `page` | Integer | No | Page number (0-indexed, default: 0) |
| `size` | Integer | No | Page size (default: 20) |
| `sort` | String | No | Sort field and direction (e.g., `createdAt,desc`) |

#### Response

**Status:** `200 OK`

```json
{
  "content": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "authorId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "title": "Tips for Managing Diabetes",
      "content": "Here are some helpful tips for daily diabetes management...",
      "category": "ADVICE",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true,
      "unsorted": false
    }
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "size": 20,
  "number": 0,
  "numberOfElements": 1,
  "empty": false
}
```

---

### 2. Get Post by ID

Retrieves a specific community post by its unique identifier.

```http
GET /api/v1/posts/{id}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | The unique post ID |

#### Response

**Status:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "authorId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "title": "Tips for Managing Diabetes",
  "content": "Here are some helpful tips for daily diabetes management...",
  "category": "ADVICE",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Status:** `404 Not Found` - Post not found

```json
{
  "error": "NOT_FOUND",
  "message": "Post not found: 550e8400-e29b-41d4-a716-446655440000",
  "details": null,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/posts/550e8400-e29b-41d4-a716-446655440000"
}
```

---

### 3. Create Post

Creates a new community post.

```http
POST /api/v1/posts
Content-Type: application/json
```

#### Request Body

```json
{
  "authorId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "title": "Tips for Managing Diabetes",
  "content": "Here are some helpful tips for daily diabetes management including diet and exercise...",
  "category": "ADVICE"
}
```

#### Field Constraints

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `authorId` | UUID | Yes | Valid UUID format |
| `title` | String | Yes | 1-150 characters, not blank |
| `content` | String | Yes | 1-2000 characters, not blank |
| `category` | Enum | Yes | One of: `GENERAL`, `SUPPORT`, `ADVICE`, `EVENT` |

#### Response

**Status:** `201 Created`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "authorId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "title": "Tips for Managing Diabetes",
  "content": "Here are some helpful tips for daily diabetes management including diet and exercise...",
  "category": "ADVICE",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Status:** `400 Bad Request` - Validation error

```json
{
  "error": "VALIDATION_FAILED",
  "message": "Validation failed",
  "details": [
    "title: Title is required",
    "content: Content must be less than 2000 characters"
  ],
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/posts"
}
```

---

### 4. Update Post

Updates an existing community post.

```http
PUT /api/v1/posts/{id}
Content-Type: application/json
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | The unique post ID |

#### Request Body

```json
{
  "title": "Updated: Tips for Managing Diabetes",
  "content": "Updated content with more detailed information about diabetes management...",
  "category": "ADVICE",
  "isActive": true
}
```

#### Field Constraints

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | String | Yes | 1-150 characters, not blank |
| `content` | String | Yes | 1-2000 characters, not blank |
| `category` | Enum | Yes | One of: `GENERAL`, `SUPPORT`, `ADVICE`, `EVENT` |
| `isActive` | Boolean | Yes | `true` or `false` |

#### Response

**Status:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "authorId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "title": "Updated: Tips for Managing Diabetes",
  "content": "Updated content with more detailed information about diabetes management...",
  "category": "ADVICE",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

**Status:** `404 Not Found` - Post not found

---

### 5. Delete Post

Deletes a community post permanently.

```http
DELETE /api/v1/posts/{id}
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | UUID | Yes | The unique post ID |

#### Response

**Status:** `204 No Content`

**Status:** `404 Not Found` - Post not found

---

### 6. Health Check

Check the service health status.

```http
GET /actuator/health
```

#### Response

**Status:** `200 OK`

```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP"
    },
    "diskSpace": {
      "status": "UP"
    },
    "ping": {
      "status": "UP"
    }
  }
}
```

---

## Data Models

### CommunityPost Entity

Represents a community post in the system.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Primary Key, Auto-generated | Unique post identifier |
| `authorId` | UUID | NOT NULL | ID of the user who created the post |
| `title` | String | NOT NULL, max 150 chars | Post title |
| `content` | String | NOT NULL, max 2000 chars | Post content/body |
| `category` | Enum | NOT NULL | Post category (GENERAL, SUPPORT, ADVICE, EVENT) |
| `isActive` | Boolean | NOT NULL, default: true | Soft delete flag |
| `createdAt` | Instant | Auto-generated | Creation timestamp |
| `updatedAt` | Instant | Auto-updated | Last modification timestamp |

**Table Name:** `community_posts`

### PostCategory Enum

| Value | Description |
|-------|-------------|
| `GENERAL` | General discussion posts |
| `SUPPORT` | Support and encouragement posts |
| `ADVICE` | Medical/health advice posts |
| `EVENT` | Events and announcements |

### CreatePostRequest DTO

Request body for creating a new post.

| Field | Type | Validation |
|-------|------|------------|
| `authorId` | UUID | `@NotNull` |
| `title` | String | `@NotBlank`, `@Size(max = 150)` |
| `content` | String | `@NotBlank`, `@Size(max = 2000)` |
| `category` | PostCategory | `@NotNull` |

### UpdatePostRequest DTO

Request body for updating an existing post.

| Field | Type | Validation |
|-------|------|------------|
| `title` | String | `@NotBlank`, `@Size(max = 150)` |
| `content` | String | `@NotBlank`, `@Size(max = 2000)` |
| `category` | PostCategory | `@NotNull` |
| `isActive` | Boolean | `@NotNull` |

### PostResponse DTO

Response body for post operations.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Post identifier |
| `authorId` | UUID | Author's user ID |
| `title` | String | Post title |
| `content` | String | Post content |
| `category` | PostCategory | Post category |
| `isActive` | Boolean | Active status |
| `createdAt` | Instant | Creation time |
| `updatedAt` | Instant | Last update time |

### ErrorResponse

Error response structure for API errors.

| Field | Type | Description |
|-------|------|-------------|
| `error` | String | Error code/type |
| `message` | String | Human-readable error message |
| `details` | List<String> | Additional error details |
| `timestamp` | Instant | Error occurrence time |
| `path` | String | Request path |

---

## Database Configuration

### MySQL Configuration

**Database Name:** `community_db`

**Connection Properties (Local Development):**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/community_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

**Connection Properties (Docker):**
```properties
spring.datasource.url=jdbc:mysql://hc-mysql-community:3306/community_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}
```

### JPA/Hibernate Settings

```properties
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.properties.hibernate.format_sql=true
```

### Database Schema

The service uses JPA auto-DDL to create/update the schema. The main table is:

```sql
CREATE TABLE community_posts (
    id BINARY(16) PRIMARY KEY,
    author_id BINARY(16) NOT NULL,
    title VARCHAR(150) NOT NULL,
    content VARCHAR(2000) NOT NULL,
    category VARCHAR(30) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## Build Instructions

### Prerequisites

- Java 17 or higher
- Maven 3.9 or higher
- MySQL 8.0 (running locally or via Docker)

### Local Build

```bash
# Navigate to service directory
cd services/community-service

# Clean and compile
mvn clean compile

# Run tests
mvn test

# Package the application
mvn clean package -DskipTests

# Run the application locally
mvn spring-boot:run
```

### Maven Profiles

| Profile | Description |
|---------|-------------|
| `default` | Uses local MySQL on port 3306 |
| `dev` | Development profile with debug logging |
| `docker` | Docker environment (configured via Config Server) |

---

## Docker Instructions

### Build Docker Image

```bash
# Navigate to service directory
cd services/community-service

# Build the image
docker build -t humancare/community:latest .
```

### Run with Docker Compose (Full Stack)

```bash
# From project root - Start all services
docker-compose up -d

# Start only community service and its database
docker-compose up -d hc-mysql-community hc-community-service

# View logs
docker-compose logs -f hc-community-service

# Check service health
docker-compose ps
```

### Run Container Only

```bash
# Run the container (requires MySQL to be running)
docker run -d \
  --name hc-community-service \
  --network humancare-network \
  -p 8087:8087 \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=root \
  -e SPRING_PROFILES_ACTIVE=docker \
  -e EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE=http://hc-eureka-server:8761/eureka/ \
  humancare/community:latest
```

### Docker Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_PORT` | Server port | `8087` |
| `SPRING_APPLICATION_NAME` | Service name | `community-service` |
| `SPRING_PROFILES_ACTIVE` | Active profile | `docker` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | - |
| `EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE` | Eureka server URL | `http://hc-eureka-server:8761/eureka/` |
| `JAVA_OPTS` | JVM options | See docker-compose.yml |

---

## Service Dependencies

### Required Services

| Service | Purpose | Required |
|---------|---------|----------|
| **MySQL** | Data persistence | ✅ Yes |
| **Eureka Server** | Service registration | ✅ Yes |
| **Config Server** | External configuration | ⚠️ Optional (fallback to local) |

### Dependency Startup Order

```
MySQL (hc-mysql-community)
    ↓
Eureka Server (hc-eureka-server)
    ↓
Config Server (hc-config-server) [optional]
    ↓
Community Service (hc-community-service)
```

### HumanCare Platform Dependencies

The Community Service integrates with the broader HumanCare platform:

| Service | Integration Type | Description |
|---------|-----------------|-------------|
| **API Gateway** | Routes traffic | Gateway routes `/api/v1/posts/**` to this service |
| **Keycloak** | Authentication | JWT token validation via Gateway |
| **Patient Service** | Business Logic | Posts may reference patients via `authorId` |

---

## Security & Roles

This service relies on the **API Gateway** and **Keycloak** for security. All endpoints (except health checks) require a valid JWT token.

### Keycloak Configuration

- **Realm:** `humancare`
- **Issuer URI:** `http://localhost:8090/realms/humancare`
- **Token Validation:** Performed at Gateway level

### Required Roles

Currently, all authenticated users (any role) can perform CRUD operations on posts. The service expects the following roles in the JWT token:

| Role | Permissions |
|------|-------------|
| `PATIENT` | Full CRUD on own posts |
| `CAREGIVER` | Full CRUD on own posts |
| `DOCTOR` | Full CRUD on own posts |
| `ADMIN` | Full CRUD on all posts |

> **Note:** Row-level security and ownership validation should be implemented at the business logic layer for production use.

---

## Testing

### API Testing with cURL

```bash
# Health check
curl http://localhost:8087/actuator/health

# Get all posts
curl -X GET http://localhost:8087/api/v1/posts \
  -H "Authorization: Bearer <jwt-token>"

# Create a post
curl -X POST http://localhost:8087/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{
    "authorId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "title": "Test Post",
    "content": "This is a test post content",
    "category": "GENERAL"
  }'

# Get post by ID
curl -X GET http://localhost:8087/api/v1/posts/{id} \
  -H "Authorization: Bearer <jwt-token>"

# Update post
curl -X PUT http://localhost:8087/api/v1/posts/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content",
    "category": "SUPPORT",
    "isActive": true
  }'

# Delete post
curl -X DELETE http://localhost:8087/api/v1/posts/{id} \
  -H "Authorization: Bearer <jwt-token>"
```

---

## Project Structure

```
services/community-service/
├── Dockerfile                          # Multi-stage Docker build
├── docker-compose.yml                  # Local MySQL for testing
├── pom.xml                            # Maven configuration
├── README.md                          # This file
└── src/
    └── main/
        ├── java/com/humancare/community/
        │   ├── CommunityServiceApplication.java
        │   ├── controller/
        │   │   └── PostController.java       # REST API endpoints
        │   ├── dto/
        │   │   ├── CreatePostRequest.java    # Create request DTO
        │   │   ├── UpdatePostRequest.java    # Update request DTO
        │   │   └── PostResponse.java         # Response DTO
        │   ├── entity/
        │   │   ├── CommunityPost.java        # JPA entity
        │   │   └── PostCategory.java         # Category enum
        │   ├── exception/
        │   │   ├── ErrorResponse.java        # Error response model
        │   │   ├── GlobalExceptionHandler.java
        │   │   └── PostNotFoundException.java
        │   ├── mapper/
        │   │   └── PostMapper.java           # Entity/DTO mapping
        │   ├── repository/
        │   │   └── PostRepository.java       # Spring Data repository
        │   └── service/
        │       └── PostService.java          # Business logic
        └── resources/
            └── application.properties        # Bootstrap config
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `Connection refused` to MySQL | MySQL not running | Start MySQL: `docker-compose up -d hc-mysql-community` |
| `Cannot register with Eureka` | Eureka not running | Start Eureka first, check network connectivity |
| `Port 8087 already in use` | Another service using port | Kill process or change port in application.properties |
| `DDL auto-create fails` | Database permissions | Ensure MySQL user has CREATE privileges |

### Logs

```bash
# View service logs
docker-compose logs -f hc-community-service

# View specific log level
mvn spring-boot:run -Dspring-boot.run.arguments="--logging.level.com.humancare.community=DEBUG"
```

---

## License

This is a school project for educational purposes.

---

## Contact

For questions or issues related to this service, please refer to the main [HumanCare README](../../README.md) or [AGENTS.md](../../AGENTS.md) for project-wide conventions and contacts.
