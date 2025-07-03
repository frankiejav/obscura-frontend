# Obscura Labs Web App - Local Development Setup

This guide will help you set up the Obscura Labs Web App on your local Ubuntu development server.

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

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Docker** and **Docker Compose** (for databases)

## Installation Steps

### 1. Install Node.js and npm

\`\`\`bash
# Update package index
sudo apt update

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
\`\`\`

### 2. Install Docker and Docker Compose

\`\`\`bash
# Install Docker
sudo apt update
sudo apt install apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker-compose --version
\`\`\`

### 3. Clone the Repository

\`\`\`bash
# Clone the repository
git clone https://github.com/obscura-labs/obscura-frontend-fc.git
cd obscura-frontend-fc
\`\`\`

### 4. Install Dependencies

\`\`\`bash
# Install Node.js dependencies
npm install

# Install additional required packages
npm install pg @elastic/elasticsearch bcrypt jsonwebtoken
npm install -D @types/pg @types/bcrypt @types/jsonwebtoken
\`\`\`

### 5. Set Up Databases with Docker Compose

Create a `docker-compose.yml` file in the project root:

\`\`\`bash
# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  # PostgreSQL for user data and application state
  postgres:
    image: postgres:15-alpine
    container_name: obscura-postgres
    environment:
      POSTGRES_DB: obscura_labs
      POSTGRES_USER: obscura_user
      POSTGRES_PASSWORD: obscura_password_dev
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-postgres.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - obscura-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U obscura_user -d obscura_labs"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Elasticsearch for search and analytics data
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: obscura-elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - cluster.name=obscura-cluster
      - node.name=obscura-node
    ports:
      - "9200:9200"
      - "9300:9300"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - obscura-network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Kibana for Elasticsearch visualization (optional)
  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    container_name: obscura-kibana
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
      - SERVER_NAME=kibana
      - SERVER_HOST=0.0.0.0
    ports:
      - "5601:5601"
    depends_on:
      elasticsearch:
        condition: service_healthy
    networks:
      - obscura-network

  # Redis for session storage and caching (optional but recommended)
  redis:
    image: redis:7-alpine
    container_name: obscura-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - obscura-network
    command: redis-server --appendonly yes

volumes:
  postgres_data:
  elasticsearch_data:
  redis_data:

networks:
  obscura-network:
    driver: bridge
EOF
\`\`\`

### 6. Create Database Initialization Scripts

Create PostgreSQL initialization script:

\`\`\`bash
# Create scripts directory
mkdir -p scripts

# Create PostgreSQL initialization script
cat > scripts/init-postgres.sql << 'EOF'
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client' CHECK (role IN ('admin', 'client')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table for JWT refresh tokens
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create application settings table
CREATE TABLE IF NOT EXISTS app_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Insert default admin user (password: admin123)
INSERT INTO users (email, name, password_hash, role) 
VALUES (
    'admin@obscuralabs.io', 
    'System Administrator', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G', -- admin123
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Insert default client user (password: client123)
INSERT INTO users (email, name, password_hash, role) 
VALUES (
    'client@obscuralabs.io', 
    'Client User', 
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- client123
    'client'
) ON CONFLICT (email) DO NOTHING;

-- Insert default application settings
INSERT INTO app_settings (key, value, description) VALUES
    ('app_name', '"Obscura Labs Intelligence Platform"', 'Application display name'),
    ('max_search_results', '1000', 'Maximum search results per query'),
    ('session_timeout', '3600', 'Session timeout in seconds'),
    ('rate_limit_requests', '100', 'Rate limit requests per window'),
    ('rate_limit_window', '900', 'Rate limit window in seconds')
ON CONFLICT (key) DO NOTHING;
EOF
\`\`\`

### 7. Environment Configuration

Create a `.env.local` file in the project root:

\`\`\`bash
# Create environment file
cat > .env.local << 'EOF'
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# PostgreSQL Configuration (User Data)
DATABASE_URL=postgresql://obscura_user:obscura_password_dev@localhost:5432/obscura_labs
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=obscura_labs
POSTGRES_USER=obscura_user
POSTGRES_PASSWORD=obscura_password_dev

# Elasticsearch Configuration (Search Data)
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
ELASTICSEARCH_INDEX_PREFIX=obscura

# Redis Configuration (Sessions & Caching)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
LOG_FORMAT=combined

# File Upload (if needed)
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
EOF
\`\`\`

### 8. Start All Services

\`\`\`bash
# Start all database services
docker-compose up -d

# Wait for services to be ready
echo "Waiting for databases to start..."
sleep 30

# Check service health
docker-compose ps
\`\`\`

### 9. Initialize Elasticsearch Indices

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

### 10. Verify Database Connections

Create and run a verification script:

\`\`\`bash
# Create database verification script
cat > scripts/verify-setup.js << 'EOF'
const { Client } = require("@elastic/elasticsearch")
const { Client: PgClient } = require('pg')

async function verifySetup() {
  console.log("Verifying database connections...")

  // Test PostgreSQL connection
  try {
    const pgClient = new PgClient({
      connectionString: process.env.DATABASE_URL || "postgresql://obscura_user:obscura_password_dev@localhost:5432/obscura_labs"
    })
    await pgClient.connect()
    const result = await pgClient.query('SELECT COUNT(*) FROM users')
    console.log(`✅ PostgreSQL connected - ${result.rows[0].count} users found`)
    await pgClient.end()
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error.message)
  }

  // Test Elasticsearch connection
  try {
    const esClient = new Client({
      node: process.env.ELASTICSEARCH_URL || "http://localhost:9200"
    })
    const health = await esClient.cluster.health()
    console.log(`✅ Elasticsearch connected - Status: ${health.status}`)
    
    const indices = await esClient.cat.indices({ format: 'json' })
    console.log(`📊 Elasticsearch indices: ${indices.map(i => i.index).join(', ')}`)
  } catch (error) {
    console.error("❌ Elasticsearch connection failed:", error.message)
  }

  console.log("Database verification completed!")
}

verifySetup()
EOF

# Run verification
node scripts/verify-setup.js
\`\`\`

### 11. Update Package.json Scripts

Add helpful scripts to your package.json:

\`\`\`bash
# Add scripts to package.json
npm pkg set scripts.db:setup="node scripts/setup-elasticsearch.js"
npm pkg set scripts.db:verify="node scripts/verify-setup.js"
npm pkg set scripts.db:start="docker-compose up -d"
npm pkg set scripts.db:stop="docker-compose down"
npm pkg set scripts.db:logs="docker-compose logs -f"
npm pkg set scripts.db:reset="docker-compose down -v && docker-compose up -d"
\`\`\`

### 12. Start the Development Server

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
- **PostgreSQL**: localhost:5432 (database: obscura_labs)
- **Elasticsearch**: http://localhost:9200
- **Kibana Dashboard**: http://localhost:5601
- **Redis**: localhost:6379

## Quick Start Commands

\`\`\`bash
# Complete setup in one go
git clone https://github.com/obscura-labs/obscura-frontend-fc.git
cd obscura-frontend-fc
npm install
npm install pg @elastic/elasticsearch bcrypt jsonwebtoken
npm install -D @types/pg @types/bcrypt @types/jsonwebtoken

# Copy the docker-compose.yml and scripts from above, then:
docker-compose up -d
sleep 30
node scripts/setup-elasticsearch.js
node scripts/verify-setup.js
npm run dev
\`\`\`

## Database Management Commands

\`\`\`bash
# PostgreSQL Commands
docker exec -it obscura-postgres psql -U obscura_user -d obscura_labs

# View users
docker exec -it obscura-postgres psql -U obscura_user -d obscura_labs -c "SELECT id, email, name, role, created_at FROM users;"

# View audit logs
docker exec -it obscura-postgres psql -U obscura_user -d obscura_labs -c "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;"

# Elasticsearch Commands
curl -X GET "localhost:9200/_cat/indices?v"
curl -X GET "localhost:9200/obscura_data/_search?pretty"

# Redis Commands
docker exec -it obscura-redis redis-cli
\`\`\`

## Development Commands

\`\`\`bash
# Database management
npm run db:start      # Start all database services
npm run db:stop       # Stop all database services
npm run db:logs       # View database logs
npm run db:setup      # Initialize Elasticsearch indices
npm run db:verify     # Verify database connections
npm run db:reset      # Reset all databases (WARNING: deletes data)

# Application
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run linting
\`\`\`

## Troubleshooting

### Database Connection Issues

\`\`\`bash
# Check if containers are running
docker-compose ps

# Check container logs
docker-compose logs postgres
docker-compose logs elasticsearch

# Test connections manually
docker exec -it obscura-postgres pg_isready -U obscura_user
curl -f http://localhost:9200/_cluster/health
\`\`\`

### Common Issues

1. **Port conflicts**: 
   \`\`\`bash
   # Check what's using the ports
   sudo lsof -i :3000
   sudo lsof -i :5432
   sudo lsof -i :9200
   
   # Kill processes if needed
   sudo kill -9 <PID>
   \`\`\`

2. **Memory issues with Elasticsearch**:
   \`\`\`bash
   # Edit docker-compose.yml and reduce memory:
   # "ES_JAVA_OPTS=-Xms256m -Xmx256m"
   \`\`\`

3. **Permission issues**:
   \`\`\`bash
   sudo chown -R $USER:$USER .
   sudo chmod +x scripts/*.js
   \`\`\`

4. **Docker permission issues**:
   \`\`\`bash
   sudo usermod -aG docker $USER
   newgrp docker
   # Or restart your session
   \`\`\`

### Elasticsearch Issues

1. **Elasticsearch won't start**:
   \`\`\`bash
   # Increase virtual memory
   sudo sysctl -w vm.max_map_count=262144
   echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf
   \`\`\`

2. **Index creation fails**:
   \`\`\`bash
   # Check Elasticsearch logs
   docker-compose logs elasticsearch
   
   # Manually test connection
   curl http://localhost:9200/_cluster/health
   \`\`\`

### Node.js Issues

1. **Module not found errors**:
   \`\`\`bash
   # Clear cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   \`\`\`

2. **TypeScript errors**:
   \`\`\`bash
   # Install missing type definitions
   npm install -D @types/node @types/react @types/react-dom
   \`\`\`

## Production Deployment Notes

⚠️ **Important**: This setup is for development only. For production:

### Security Checklist
- [ ] Change all default passwords and secrets
- [ ] Enable PostgreSQL SSL/TLS
- [ ] Enable Elasticsearch security features
- [ ] Use environment-specific configurations
- [ ] Configure proper firewall rules
- [ ] Use HTTPS everywhere
- [ ] Implement rate limiting
- [ ] Set up monitoring and alerting

### Performance Optimizations
- [ ] Use managed database services (AWS RDS, Elastic Cloud)
- [ ] Configure connection pooling
- [ ] Set up Redis clustering
- [ ] Implement caching strategies
- [ ] Configure CDN for static assets

### Monitoring & Backup
- [ ] Set up application monitoring (DataDog, New Relic)
- [ ] Configure log aggregation (ELK stack)
- [ ] Implement automated backups
- [ ] Set up disaster recovery procedures

## Getting Help

If you encounter issues:

1. **Check the logs**: `docker-compose logs`
2. **Verify services**: `docker-compose ps`
3. **Test connections**: `npm run db:verify`
4. **Check Elasticsearch health**: `curl http://localhost:9200/_cluster/health`
5. **Review application logs** in the terminal running `npm run dev`

For additional help, refer to the main README.md or contact the development team.

## Next Steps

After successful setup:

1. **Explore the application** at http://localhost:3000
2. **Check Kibana dashboard** at http://localhost:5601
3. **Review database schemas** using the PostgreSQL commands above
4. **Test search functionality** with sample data
5. **Set up your IDE** with proper TypeScript support
6. **Configure git hooks** for code quality
7. **Set up testing environment** for development

The application is now ready for development! 🚀
