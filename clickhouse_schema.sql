-- ClickHouse schema for vault.creds table
-- Optimized for billions of rows with fast exact-match filters

CREATE DATABASE IF NOT EXISTS vault;

CREATE TABLE IF NOT EXISTS vault.creds
(
    ts           DateTime        DEFAULT now(),
    victim_id    String,
    source_name  String,
    domain       LowCardinality(String) DEFAULT '',
    email        String DEFAULT '',
    username     String DEFAULT '',
    password     Nullable(String),
    phone        Nullable(String),
    name         Nullable(String),
    address      Nullable(String),
    country      Nullable(String),
    origin       Nullable(String),
    fields       Array(String),
    
    -- Personal Info fields
    hostname     Nullable(String),
    ip_address   Nullable(String),
    language     Nullable(String),
    timezone     Nullable(String),
    
    -- System Info fields  
    os_version   Nullable(String),
    hwid         Nullable(String),
    cpu_name     Nullable(String),
    gpu          Nullable(String),
    ram_size     Nullable(String),

    INDEX bf_email   email    TYPE tokenbf_v1(1024, 3, 0)  GRANULARITY 64,
    INDEX bf_user    username TYPE tokenbf_v1(1024, 3, 0)  GRANULARITY 64,
    INDEX set_domain domain   TYPE set(8192)         GRANULARITY 64,
    INDEX bf_ip      ip_address TYPE tokenbf_v1(1024, 3, 0) GRANULARITY 64
)
ENGINE = ReplacingMergeTree(ts)
ORDER BY (domain, email, username, victim_id)
SETTINGS index_granularity = 8192;
