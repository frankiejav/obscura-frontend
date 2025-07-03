# Obscura Labs Web App - Local Development Setup

This guide will help you set up the Obscura Labs Private Intelligence Operations Dashboard on your Ubuntu development server. The application uses a dual-database architecture with PostgreSQL for user data and Elasticsearch for search operations.

## Database Architecture

This application uses a **dual-database architecture** for optimal performance and separation of concerns:

### 1. PostgreSQL - User & Application Data
- **Purpose**: User authentication, profiles, settings, audit logs, session management
- **Why**: ACID compliance, relational data, better for transactional operations
- **Data**: Users, roles, permissions, audit trails, application configuration

### 2. Elasticsearch - Search & Analytics Data  
- **Purpose**: Large-scale data search, filtering, and analytics
- **Why**: Optimized for full-text search, aggregations, and real-time analytics
- **Data**: Leaked data records, threat intelligence, search indices

## Prerequisites

Before starting, ensure you have the following installed on your Ubuntu system:

### 1. Update System
\`\`\`bash
sudo apt update && sudo apt upgrade -y
\`\`\`

### 2. Install Node.js 18+
\`\`\`bash
# Install Node.js via NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
\`\`\`

### 3. Install Docker and Docker Compose
\`\`\`bash
# Install Docker
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker-compose --version
\`\`\`

### 4. Install Git
\`\`\`bash
sudo apt-get install -y git
\`\`\`

## Installation Steps

### 1. Clone the Repository

\`\`\`bash
# Clone the repository
git clone https://github.com/obscura-labs/obscura-frontend-fc.git
cd obscura-frontend-fc
\`\`\`

### 2. Install Dependencies

\`\`\`bash
# Install Node.js dependencies
npm install
\`\`\`

### 3. Set Up Databases with Docker Compose

Create a `docker-compose.yml` file in the project root:

\`\`\`yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: obscura_postgres
    environment:
      POSTGRES_DB: obscura_db
      POSTGRES_USER: obscura_user
      POSTGRES_PASSWORD: obscura_secure_password_2024
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-postgres.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U obscura_user -d obscura_db"]
      interval: 30s
      timeout: 10s
      retries: 3

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: obscura_elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
      - "9300:9300"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    container_name: obscura_kibana
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

  redis:
    image: redis:7-alpine
    container_name: obscura_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  elasticsearch_data:
  redis_data:
\`\`\`

### 4. Create Database Initialization Scripts

Create PostgreSQL initialization script:

\`\`\`sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
\`\`\`

### 5. Environment Configuration

Create a `.env.local` file in the project root:

\`\`\`env
# Database Configuration
DATABASE_URL="postgresql://obscura_user:obscura_secure_password_2024@localhost:5432/obscura_db"
POSTGRES_URL="postgresql://obscura_user:obscura_secure_password_2024@localhost:5432/obscura_db"
POSTGRES_PRISMA_URL="postgresql://obscura_user:obscura_secure_password_2024@localhost:5432/obscura_db"
DATABASE_URL_UNPOOLED="postgresql://obscura_user:obscura_secure_password_2024@localhost:5432/obscura_db"
POSTGRES_URL_NON_POOLING="postgresql://obscura_user:obscura_secure_password_2024@localhost:5432/obscura_db"

# PostgreSQL Direct Connection
PGHOST="localhost"
PGUSER="obscura_user"
PGPASSWORD="obscura_secure_password_2024"
PGDATABASE="obscura_db"
POSTGRES_USER="obscura_user"
POSTGRES_PASSWORD="obscura_secure_password_2024"
POSTGRES_DATABASE="obscura_db"
POSTGRES_HOST="localhost"

# Elasticsearch Configuration
ELASTICSEARCH_URL="http://localhost:9200"
ELASTICSEARCH_NODE="http://localhost:9200"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secure-refresh-secret-key-change-this-too"

# Bcrypt Configuration
BCRYPT_ROUNDS="12"

# Application Configuration
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Security
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="900000"
\`\`\`

### 6. Start All Services

\`\`\`bash
# Start all database services
docker-compose up -d

# Check service status
docker-compose ps

# View logs if needed
docker-compose logs -f
\`\`\`

### 7. Initialize Elasticsearch Indices

Create and run the Elasticsearch setup script:

\`\`\`bash
# Create the setup script
cat > scripts/setup-elasticsearch.js << 'EOF'
const { Client } = require("@elastic/elasticsearch")

async function setupElasticsearch() {
  console.log("Setting up Elasticsearch indices and mappings...")

  try {
    // Create a client instance
    const client = new Client({
      node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
    })

    // Check if Elasticsearch is running
    const health = await client.cluster.health()
    console.log(`Elasticsearch cluster status: ${health.status}`)

    // Create main data index
    const dataIndexExists = await client.indices.exists({ index: "obscura_data" })
    if (!dataIndexExists) {
      await client.indices.create({
        index: "obscura_data",
        body: {
          mappings: {
            properties: {
              // Personal Information
              name: { type: "text", fields: { keyword: { type: "keyword" } } },
              email: { type: "text", fields: { keyword: { type: "keyword" } } },
              phone: { type: "text", fields: { keyword: { type: "keyword" } } },
              address: { type: "text" },
              
              // Technical Information
              ip: { type: "ip" },
              domain: { type: "text", fields: { keyword: { type: "keyword" } } },
              url: { type: "text", fields: { keyword: { type: "keyword" } } },
              hash: { type: "keyword" },
              
              // Metadata
              source: { type: "keyword" },
              breach_name: { type: "keyword" },
              breach_date: { type: "date" },
              timestamp: { type: "date" },
              severity: { type: "keyword" },
              category: { type: "keyword" },
              
              // Geographic
              country: { type: "keyword" },
              region: { type: "keyword" },
              city: { type: "keyword" },
              
              // Full-text search
              content: { type: "text" },
              tags: { type: "keyword" }
            }
          },
          settings: {
            number_of_shards: 3,
            number_of_replicas: 1,
            "index.max_result_window": 50000
          }
        }
      })
      console.log('Index "obscura_data" created successfully')
    } else {
      console.log('Index "obscura_data" already exists')
    }

    // Create search analytics index
    const analyticsIndexExists = await client.indices.exists({ index: "obscura_analytics" })
    if (!analyticsIndexExists) {
      await client.indices.create({
        index: "obscura_analytics",
        body: {
          mappings: {
            properties: {
              user_id: { type: "keyword" },
              query: { type: "text" },
              filters: { type: "object" },
              results_count: { type: "integer" },
              response_time: { type: "integer" },
              timestamp: { type: "date" },
              ip_address: { type: "ip" },
              user_agent: { type: "text" }
            }
          }
        }
      })
      console.log('Index "obscura_analytics" created successfully')
    }

    // Create threat intelligence index
    const threatIndexExists = await client.indices.exists({ index: "obscura_threats" })
    if (!threatIndexExists) {
      await client.indices.create({
        index: "obscura_threats",
        body: {
          mappings: {
            properties: {
              threat_type: { type: "keyword" },
              indicator: { type: "keyword" },
              indicator_type: { type: "keyword" }, // ip, domain, hash, email
              confidence: { type: "integer" },
              severity: { type: "keyword" },
              description: { type: "text" },
              source: { type: "keyword" },
              first_seen: { type: "date" },
              last_seen: { type: "date" },
              tags: { type: "keyword" },
              ioc_data: { type: "object" }
            }
          }
        }
      })
      console.log('Index "obscura_threats" created successfully')
    }

    console.log("Elasticsearch setup completed successfully")
  } catch (error) {
    console.error("Error setting up Elasticsearch:", error)
    process.exit(1)
  }
}

setupElasticsearch()
EOF

# Run the setup script
node scripts/setup-elasticsearch.js
\`\`\`

### 8. Create Admin Account

\`\`\`bash
npm run admin:create
\`\`\`

### 9. Start the Development Server

\`\`\`bash
# Start the Next.js development server
npm run dev
\`\`\`

The application will be available at `http://localhost:3000`

## Accessing the Application

### Default Login Credentials

- **Admin User**:
  - Email: `admin@obscuralabs.io`
  - Password: `admin123`

- **Client User**:
  - Email: `client@obscuralabs.io`  
  - Password: `client123`

### Services URLs

- **Main Application**: http://localhost:3000
- **Kibana Dashboard**: http://localhost:5601
- **Elasticsearch API**: http://localhost:9200

## Quick Start Commands

\`\`\`bash
# Complete setup in one go
git clone https://github.com/obscura-labs/obscura-frontend-fc.git
cd obscura-frontend-fc
npm install
docker-compose up -d
sleep 30
node scripts/setup-elasticsearch.js
npm run admin:create
npm run dev
\`\`\`

## Database Management Commands

\`\`\`bash
# PostgreSQL Commands
docker exec -it obscura_postgres psql -U obscura_user -d obscura_db

# View users
docker exec -it obscura_postgres psql -U obscura_user -d obscura_db -c "SELECT id, email, name, role, created_at FROM users;"

# View audit logs
docker exec -it obscura_postgres psql -U obscura_user -d obscura_db -c "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;"

# Elasticsearch Commands
curl -X GET "localhost:9200/_cat/indices?v"
curl -X GET "localhost:9200/obscura_data/_search?pretty"

# Redis Commands
docker exec -it obscura_redis redis-cli
\`\`\`

## Development Commands

\`\`\`bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database Management
npm run db:setup        # Initialize all databases
npm run db:seed         # Seed with sample data
npm run db:reset        # Reset all databases

# Admin Management
npm run admin:create    # Create admin account
npm run admin:setup     # Full admin setup with prompts

# Testing
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript checks
\`\`\`

### Docker Management
\`\`\`bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service_name]

# Restart specific service
docker-compose restart [service_name]

# Remove all data (DESTRUCTIVE)
docker-compose down -v
\`\`\`

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
\`\`\`bash
# Check what's using the port
sudo lsof -i :3000
sudo lsof -i :5432
sudo lsof -i :9200

# Kill process if needed
sudo kill -9 <PID>
\`\`\`

#### 2. Docker Permission Denied
\`\`\`bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Or run with sudo (not recommended)
sudo docker-compose up -d
\`\`\`

#### 3. Elasticsearch Memory Issues
\`\`\`bash
# Increase virtual memory
sudo sysctl -w vm.max_map_count=262144

# Make permanent
echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf
\`\`\`

#### 4. Database Connection Issues
\`\`\`bash
# Check if services are running
docker-compose ps

# Check service logs
docker-compose logs postgres
docker-compose logs elasticsearch

# Restart services
docker-compose restart
\`\`\`

#### 5. Environment Variables Not Loading
\`\`\`bash
# Ensure .env.local exists and has correct format
cat .env.local

# Check if variables are loaded
node -e "console.log(process.env.DATABASE_URL)"
\`\`\`

### Performance Optimization

#### 1. Elasticsearch Settings
\`\`\`bash
# Increase heap size for better performance
# Edit docker-compose.yml:
# ES_JAVA_OPTS=-Xms1g -Xmx1g
\`\`\`

#### 2. PostgreSQL Tuning
\`\`\`bash
# Connect to PostgreSQL and run:
# ALTER SYSTEM SET shared_buffers = '256MB';
# ALTER SYSTEM SET effective_cache_size = '1GB';
# SELECT pg_reload_conf();
\`\`\`

#### 3. Redis Configuration
\`\`\`bash
# Add to docker-compose.yml redis service:
# command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
\`\`\`

## Security Considerations

### Development Environment
- ✅ Use strong passwords for all services
- ✅ Keep services on localhost only
- ✅ Regularly update dependencies
- ✅ Use environment variables for secrets

### Production Deployment
- 🔒 Use SSL/TLS certificates
- 🔒 Configure firewall rules
- 🔒 Enable database authentication
- 🔒 Use secrets management
- 🔒 Enable audit logging
- 🔒 Regular security updates
- 🔒 Backup strategies

## Backup and Recovery

### Database Backups
\`\`\`bash
# PostgreSQL backup
docker exec obscura_postgres pg_dump -U obscura_user obscura_db > backup.sql

# Elasticsearch backup
curl -X PUT "localhost:9200/_snapshot/backup_repo" -H 'Content-Type: application/json' -d'
{
  "type": "fs",
  "settings": {
    "location": "/usr/share/elasticsearch/backup"
  }
}'
\`\`\`

### Restore Procedures
\`\`\`bash
# PostgreSQL restore
docker exec -i obscura_postgres psql -U obscura_user obscura_db < backup.sql

# Elasticsearch restore
curl -X POST "localhost:9200/_snapshot/backup_repo/snapshot_1/_restore"
\`\`\`

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review application logs: `docker-compose logs -f`
3. Check service health endpoints
4. Verify environment configuration

## Next Steps

After successful setup:
1. Create your admin account using `npm run admin:create`
2. Log in to the application at http://localhost:3000
3. Configure user roles and permissions
4. Set up data ingestion pipelines
5. Configure monitoring and alerting
6. Plan production deployment strategy

The application is now ready for development and testing!
