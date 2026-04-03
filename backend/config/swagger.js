
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Dashboard API",
      version: "1.0.0",
      description: "Backend API for Finance Dashboard System with role based access control",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            role: { type: "string", enum: ["viewer", "analyst", "admin"] },
            status: { type: "string", enum: ["active", "inactive"] },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
       
        FinancialRecord: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            amount: { type: "number", example: 5000.00 },
            type: { type: "string", enum: ["income", "expense"] },
            category: { type: "string", example: "salary" },
            date: { type: "string", format: "date", example: "2024-01-15" },
            note: { type: "string", example: "Monthly salary" },
            userId: { type: "string", format: "uuid" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
       
        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
   
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Users", description: "User management endpoints — Admin only" },
      { name: "Records", description: "Financial records endpoints" },
      { name: "Dashboard", description: "Dashboard summary endpoints" },
    ],
    paths: {
    
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login",
          description: "Login with email and password to get JWT token",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", example: "admin@finance.com" },
                    password: { type: "string", example: "Admin@123" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      token: { type: "string" },
                      user: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
            400: { description: "Missing fields" },
            401: { description: "Invalid credentials" },
            403: { description: "Account inactive" },
          },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current user",
          description: "Get profile of currently logged in user",
          responses: {
            200: {
              description: "Current user profile",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
          },
        },
      },

      
      "/api/users": {
        get: {
          tags: ["Users"],
          summary: "Get all users",
          description: "Admin only — get all users with pagination",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", example: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", example: 10 } },
          ],
          responses: {
            200: { description: "List of users" },
            401: { description: "Unauthorized" },
            403: { description: "Access denied" },
          },
        },
        post: {
          tags: ["Users"],
          summary: "Create user",
          description: "Admin only — create a new user with any role",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string", example: "Jane Analyst" },
                    email: { type: "string", example: "analyst@finance.com" },
                    password: { type: "string", example: "Pass@123" },
                    role: { type: "string", enum: ["viewer", "analyst", "admin"], example: "analyst" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User created successfully" },
            400: { description: "Validation error" },
            401: { description: "Unauthorized" },
            403: { description: "Access denied" },
            409: { description: "Email already exists" },
          },
        },
      },
      "/api/users/{id}": {
        get: {
          tags: ["Users"],
          summary: "Get single user",
          description: "Admin only — get user by ID",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "User found" },
            404: { description: "User not found" },
          },
        },
        delete: {
          tags: ["Users"],
          summary: "Delete user",
          description: "Admin only — soft delete user",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "User deleted" },
            404: { description: "User not found" },
          },
        },
      },
      "/api/users/{id}/role": {
        patch: {
          tags: ["Users"],
          summary: "Update user role",
          description: "Admin only — assign role to user",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["role"],
                  properties: {
                    role: { type: "string", enum: ["viewer", "analyst", "admin"] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Role updated" },
            400: { description: "Invalid role" },
            404: { description: "User not found" },
          },
        },
      },
      "/api/users/{id}/status": {
        patch: {
          tags: ["Users"],
          summary: "Update user status",
          description: "Admin only — activate or deactivate user",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: { type: "string", enum: ["active", "inactive"] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Status updated" },
            400: { description: "Invalid status" },
            404: { description: "User not found" },
          },
        },
      },

      // ─── RECORDS ──────────────────────────────────────────
      "/api/records": {
        get: {
          tags: ["Records"],
          summary: "Get all records",
          description: "Analyst, Admin — get all records with filters and pagination",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", example: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", example: 10 } },
            { name: "type", in: "query", schema: { type: "string", enum: ["income", "expense"] } },
            { name: "category", in: "query", schema: { type: "string", example: "food" } },
            { name: "startDate", in: "query", schema: { type: "string", example: "2024-01-01" } },
            { name: "endDate", in: "query", schema: { type: "string", example: "2024-12-31" } },
            { name: "search", in: "query", schema: { type: "string", example: "salary" } },
          ],
          responses: {
            200: { description: "List of records" },
            401: { description: "Unauthorized" },
            403: { description: "Access denied" },
          },
        },
        post: {
          tags: ["Records"],
          summary: "Create record",
          description: "Analyst, Admin — create a new financial record",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["amount", "type", "date"],
                  properties: {
                    amount: { type: "number", example: 5000 },
                    type: { type: "string", enum: ["income", "expense"] },
                    category: { type: "string", example: "salary" },
                    date: { type: "string", example: "2024-01-15" },
                    note: { type: "string", example: "Monthly salary" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Record created" },
            400: { description: "Validation error" },
            401: { description: "Unauthorized" },
            403: { description: "Access denied" },
          },
        },
      },
      "/api/records/{id}": {
        get: {
          tags: ["Records"],
          summary: "Get single record",
          description: "Analyst, Admin — get record by ID",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Record found" },
            404: { description: "Record not found" },
          },
        },
        patch: {
          tags: ["Records"],
          summary: "Update record",
          description: "Analyst, Admin — update a financial record",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    amount: { type: "number", example: 6000 },
                    type: { type: "string", enum: ["income", "expense"] },
                    category: { type: "string", example: "salary" },
                    date: { type: "string", example: "2024-01-15" },
                    note: { type: "string", example: "Updated salary" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Record updated" },
            400: { description: "Validation error" },
            404: { description: "Record not found" },
          },
        },
        delete: {
          tags: ["Records"],
          summary: "Delete record",
          description: "Admin only — soft delete a record",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Record deleted" },
            404: { description: "Record not found" },
          },
        },
      },

      // ─── DASHBOARD ────────────────────────────────────────
      "/api/dashboard/summary": {
        get: {
          tags: ["Dashboard"],
          summary: "Get summary",
          description: "Viewer, Analyst, Admin — total income, expenses and net balance",
          responses: {
            200: {
              description: "Dashboard summary",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      totalIncome: { type: "number", example: 50000 },
                      totalExpenses: { type: "number", example: 30000 },
                      netBalance: { type: "number", example: 20000 },
                      totalRecords: { type: "integer", example: 25 },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/dashboard/category": {
        get: {
          tags: ["Dashboard"],
          summary: "Get category wise totals",
          description: "Viewer, Analyst, Admin — breakdown by category",
          responses: {
            200: { description: "Category wise totals" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/dashboard/recent": {
        get: {
          tags: ["Dashboard"],
          summary: "Get recent activity",
          description: "Viewer, Analyst, Admin — latest financial records",
          parameters: [
            { name: "limit", in: "query", schema: { type: "integer", example: 10 } },
          ],
          responses: {
            200: { description: "Recent records" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/dashboard/trends": {
        get: {
          tags: ["Dashboard"],
          summary: "Get monthly trends",
          description: "Viewer, Analyst, Admin — monthly income and expense breakdown",
          responses: {
            200: { description: "Monthly trends" },
            401: { description: "Unauthorized" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;