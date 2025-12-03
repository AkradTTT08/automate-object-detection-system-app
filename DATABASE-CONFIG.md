# Database Configuration Guide

## 📋 Configuration Files

### 1. Environment Variables (`.env.local.docker` สำหรับ Docker)

```env
# Database Configuration
DATABASE_HOST=postgres          # ชื่อ service ใน Docker network (หรือ localhost ถ้าไม่ใช้ Docker)
POSTGRES_PORT=5432              # Port ภายใน Docker network (ใช้ 5432)
POSTGRES_DB=aods_dev_v3         # ชื่อ database
POSTGRES_USER=postgres          # Username
POSTGRES_PASSWORD=postgres      # Password
```

### 2. Docker Compose Configuration (`docker-compose.dev.yml`)

```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: aods-postgres-dev
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-aods_dev_v3}
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "${POSTGRES_PORT:-5433}:5432"  # External:Internal (5433 เพื่อหลีกเลี่ยง conflict)
    volumes:
      - postgres_data_dev:/var/lib/postgresql/data
      - ./aods_dev_v3.sql:/docker-entrypoint-initdb.d/aods_dev_v3.sql:ro
    networks:
      - aods-network-dev

  server:
    environment:
      - DATABASE_HOST=postgres      # ชื่อ service ใน Docker network
      - POSTGRES_PORT=5432          # Port ภายใน Docker network
```

### 3. Server Code Configuration (`server/src/config/db.ts`)

```typescript
import { Pool } from 'pg';
import { env } from './env'

export const pool = new Pool({
    host: env.PGHOST,              // จาก DATABASE_HOST
    port: env.PGPORT,               // จาก POSTGRES_PORT
    database: env.PGDATABASE,       // จาก POSTGRES_DB
    user: env.PGUSER,               // จาก POSTGRES_USER
    password: env.PGPASSWORD,       // จาก POSTGRES_PASSWORD
    options: `-c search_path=aods_dev_v3`  // ตั้งค่า schema default
});
```

### 4. Environment Mapping (`server/src/config/env.ts`)

```typescript
export const env = {
    PORT: Number(process.env.PORT),
    PGHOST: process.env.DATABASE_HOST,        // → DATABASE_HOST
    PGPORT: Number(process.env.POSTGRES_PORT), // → POSTGRES_PORT
    PGDATABASE: process.env.POSTGRES_DB,       // → POSTGRES_DB
    PGUSER: process.env.POSTGRES_USER,         // → POSTGRES_USER
    PGPASSWORD: process.env.POSTGRES_PASSWORD, // → POSTGRES_PASSWORD
};
```

## 🔗 Connection Details

### สำหรับ Docker Environment

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Host** | `postgres` | ชื่อ service ใน Docker network |
| **Port** | `5432` | Port ภายใน Docker network |
| **Database** | `aods_dev_v3` | ชื่อ database |
| **Schema** | `aods_dev_v3` | Schema ที่ใช้ (ตั้งใน connection options) |
| **User** | `postgres` | Username |
| **Password** | `postgres` | Password |

**Connection String (ภายใน Docker):**
```
postgresql://postgres:postgres@postgres:5432/aods_dev_v3?search_path=aods_dev_v3
```

### สำหรับ Local Development (ไม่ใช้ Docker)

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Host** | `localhost` | หรือ IP address ของ database server |
| **Port** | `5432` | หรือ `5433` ถ้าใช้ Docker PostgreSQL |
| **Database** | `aods_dev_v3` | ชื่อ database |
| **Schema** | `aods_dev_v3` | Schema ที่ใช้ |
| **User** | `postgres` | Username |
| **Password** | `postgres` | Password |

**Connection String (จาก Host Machine):**
```
postgresql://postgres:postgres@localhost:5433/aods_dev_v3?search_path=aods_dev_v3
```

## 🔧 การตั้งค่า Environment Variables

### สำหรับ Docker (`.env.local.docker`)

```env
# Database Configuration
DATABASE_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=aods_dev_v3
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

### สำหรับ Local Development (`.env.local`)

```env
# Database Configuration
DATABASE_HOST=localhost
POSTGRES_PORT=5433              # ถ้าใช้ Docker PostgreSQL
# หรือ
POSTGRES_PORT=5432              # ถ้าใช้ local PostgreSQL
POSTGRES_DB=aods_dev_v3
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

## 🔍 การตรวจสอบ Connection

### 1. ตรวจสอบจาก Server Container

```bash
# เข้าไปใน server container
docker exec -it aods-server-dev sh

# ตรวจสอบ environment variables
env | grep -E "DATABASE|POSTGRES"

# ทดสอบ connection ด้วย node
node -e "const { Pool } = require('pg'); const pool = new Pool({host: process.env.DATABASE_HOST, port: process.env.POSTGRES_PORT, database: process.env.POSTGRES_DB, user: process.env.POSTGRES_USER, password: process.env.POSTGRES_PASSWORD}); pool.query('SELECT NOW()', (err, res) => {console.log(err || res.rows[0]); pool.end();});"
```

### 2. ตรวจสอบจาก Host Machine

```bash
# ใช้ psql (ต้องติดตั้ง PostgreSQL client)
psql -h localhost -p 5433 -U postgres -d aods_dev_v3

# หรือใช้ Docker
docker exec -it aods-postgres-dev psql -U postgres -d aods_dev_v3

# ทดสอบ connection
\c aods_dev_v3
\dt  # แสดง tables
SELECT current_schema();  # แสดง schema ปัจจุบัน
```

### 3. ตรวจสอบจาก Application

```bash
# ตรวจสอบ health endpoint
curl http://localhost:8066/api/health

# ตรวจสอบ logs
docker logs aods-server-dev | grep -i "database\|postgres\|error"
```

## 📝 Schema Configuration

Database ใช้ schema `aods_dev_v3` ซึ่งถูกตั้งค่าใน:

1. **Connection Options** (`server/src/config/db.ts`):
   ```typescript
   options: `-c search_path=aods_dev_v3`
   ```

2. **SQL File** (`aods_dev_v3.sql`):
   ```sql
   SET search_path TO aods_dev_v3;
   ```

3. **Init Script** (`init-db.sh`):
   ```bash
   CREATE SCHEMA IF NOT EXISTS aods_dev_v3;
   ```

## 🚨 Troubleshooting

### ปัญหา: Connection Refused

**สาเหตุ:**
- `DATABASE_HOST` ไม่ถูกต้อง (ควรเป็น `postgres` ใน Docker)
- Port ไม่ถูกต้อง
- PostgreSQL container ไม่ได้รัน

**แก้ไข:**
```bash
# ตรวจสอบ PostgreSQL container
docker ps | grep postgres

# ตรวจสอบ network
docker network inspect automate-object-detection-system-app_aods-network-dev

# Restart PostgreSQL
docker-compose -f docker-compose.dev.yml restart postgres
```

### ปัญหา: Authentication Failed

**สาเหตุ:**
- Username/Password ไม่ถูกต้อง
- Environment variables ไม่ถูก load

**แก้ไข:**
```bash
# ตรวจสอบ environment variables ใน container
docker exec aods-server-dev env | grep POSTGRES

# ตรวจสอบ .env.local.docker
cat .env.local.docker
```

### ปัญหา: Schema Not Found

**สาเหตุ:**
- Schema `aods_dev_v3` ยังไม่ได้ถูกสร้าง
- Search path ไม่ถูกตั้งค่า

**แก้ไข:**
```bash
# สร้าง schema manually
docker exec -it aods-postgres-dev psql -U postgres -d aods_dev_v3 -c "CREATE SCHEMA IF NOT EXISTS aods_dev_v3;"

# ตรวจสอบ schema
docker exec -it aods-postgres-dev psql -U postgres -d aods_dev_v3 -c "\dn"
```

## 📊 Connection Pool Settings

ปัจจุบันใช้ default settings ของ `pg.Pool`:

- **Max connections:** 10 (default)
- **Idle timeout:** 10 seconds (default)
- **Connection timeout:** 0 (no timeout)

หากต้องการปรับแต่งเพิ่มเติม สามารถแก้ไขใน `server/src/config/db.ts`:

```typescript
export const pool = new Pool({
    host: env.PGHOST,
    port: env.PGPORT,
    database: env.PGDATABASE,
    user: env.PGUSER,
    password: env.PGPASSWORD,
    options: `-c search_path=aods_dev_v3`,
    max: 20,                    // Maximum number of clients
    idleTimeoutMillis: 30000,   // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});
```

