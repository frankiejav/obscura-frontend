import { buildSchema } from 'graphql'

export const schema = buildSchema(`
  scalar DateTime
  scalar JSON

  # LeakCheck types
  type LeakCheckResult {
    email: String!
    source: LeakCheckSource!
    first_name: String
    last_name: String
    username: String
    fields: [String!]!
  }

  type LeakCheckSource {
    name: String!
    breach_date: String
    unverified: Int!
    passwordless: Int!
    compilation: Int!
  }

  type LeakCheckSearchResult {
    success: Boolean!
    found: Int!
    quota: Int!
    result: [LeakCheckResult!]!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: UserRole!
    lastActive: DateTime
  }

  enum UserRole {
    ADMIN
    CLIENT
  }

  type Notification {
    id: ID!
    title: String!
    message: String!
    type: NotificationType!
    priority: NotificationPriority!
    isRead: Boolean!
    createdAt: DateTime!
    createdBy: User
    targetUserId: ID
    metadata: JSON
  }

  enum NotificationType {
    ACCOUNT_CHANGE
    PASSWORD_CHANGE
    EMAIL_CHANGE
    NEW_RECORD
    ADMIN_ALERT
    SYSTEM_ALERT
    SECURITY_ALERT
    LEAKCHECK_ALERT
  }

  enum NotificationPriority {
    LOW
    MEDIUM
    HIGH
    CRITICAL
  }

  type DataRecord {
    id: ID!
    name: String
    email: String
    ip: String
    domain: String
    source: String!
    timestamp: DateTime!
    additionalData: JSON
  }

  type DataSource {
    id: ID!
    name: String!
    recordCount: Int!
    lastUpdated: DateTime!
    status: DataSourceStatus!
  }

  enum DataSourceStatus {
    ACTIVE
    PROCESSING
    ERROR
  }

  type AuditLog {
    id: ID!
    userId: ID!
    user: User
    action: String!
    details: JSON
    timestamp: DateTime!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type DataRecordConnection {
    edges: [DataRecordEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type DataRecordEdge {
    node: DataRecord!
    cursor: String!
  }

  type NotificationConnection {
    edges: [NotificationEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type NotificationEdge {
    node: Notification!
    cursor: String!
  }

  type SearchResult {
    results: [DataRecord!]!
    pagination: PaginationInfo!
  }

  type PaginationInfo {
    total: Int!
    pages: Int!
    current: Int!
  }

  input SearchInput {
    term: String!
    type: SearchType!
    page: Int!
    limit: Int!
  }

  enum SearchType {
    ALL
    NAME
    EMAIL
    IP
    DOMAIN
    SOURCE
  }

  input DataRecordInput {
    name: String
    email: String
    ip: String
    domain: String
    source: String!
    additionalData: JSON
  }

  type Query {
    # User queries
    me: User!
    user(id: ID!): User
    users(first: Int, after: String): [User!]!
    # Notification queries
    notifications(
      first: Int, 
      after: String, 
      isRead: Boolean
    ): NotificationConnection!
    unreadNotificationCount: Int!
    # Data queries
    dataRecord(id: ID!): DataRecord
    dataRecords(
      first: Int, 
      after: String, 
      source: String
    ): DataRecordConnection!
    # Search
    search(
      term: String!, 
      type: String!, 
      page: Int!, 
      limit: Int!
    ): SearchResult!
    # LeakCheck queries
    leakCheckSearch(
      query: String!, 
      type: String
    ): LeakCheckSearchResult!
    # Data sources
    dataSources: [DataSource!]!
    dataSource(id: ID!): DataSource
    # Audit logs
    auditLogs(
      userId: ID, 
      action: String, 
      from: DateTime, 
      to: DateTime, 
      first: Int, 
      after: String
    ): [AuditLog!]!
  }

  type Mutation {
    # Auth mutations
    login(email: String!, password: String!): AuthPayload!
    refreshToken(token: String!): AuthPayload!
    # User mutations
    createUser(name: String!, email: String!, password: String!, role: UserRole!): User!
    updateUser(id: ID!, name: String, email: String, role: UserRole): User!
    deleteUser(id: ID!): Boolean!
    # Notification mutations
    createNotification(
      title: String!
      message: String!
      type: NotificationType!
      priority: NotificationPriority!
      targetUserId: ID
    ): Notification!
    markNotificationAsRead(id: ID!): Notification!
    markAllNotificationsAsRead: Boolean!
    deleteNotification(id: ID!): Boolean!
    # Data mutations (admin only)
    createDataRecord(input: DataRecordInput!): DataRecord!
    updateDataRecord(id: ID!, input: DataRecordInput!): DataRecord!
    deleteDataRecord(id: ID!): Boolean!
    # Data source mutations (admin only)
    refreshDataSource(id: ID!): DataSource!
    # LeakCheck mutations (admin only)
    syncLeakCheckData: Boolean!
  }

  type AuthPayload {
    token: String!
    refreshToken: String!
    user: User!
  }
`) 