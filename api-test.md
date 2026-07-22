# API Test Cases

## Overview
Test cases for Teddy Bear Shop API endpoints

## Base URL
`http://localhost:3000/api`

---

## 1. Products Endpoints

### GET /products
- **Expected Status**: 200
- **Expected Response**: Array of products with id, name, price, description
- **Test Cases**:
  - [ ] Retrieve all products successfully
  - [ ] Verify product count > 0
  - [ ] Verify product structure (id, name, price, description)

### GET /products/:id
- **Expected Status**: 200 (success) / 404 (not found)
- **Test Cases**:
  - [ ] Get product by valid ID
  - [ ] Get product by invalid ID returns 404
  - [ ] Verify response contains correct product data

### POST /products
- **Expected Status**: 201
- **Required Fields**: name, price, description
- **Test Cases**:
  - [ ] Create product with valid data
  - [ ] Create product missing required fields returns 400
  - [ ] Verify created product has assigned ID

### PUT /products/:id
- **Expected Status**: 200
- **Test Cases**:
  - [ ] Update existing product successfully
  - [ ] Update non-existent product returns 404
  - [ ] Verify updated fields are saved

### DELETE /products/:id
- **Expected Status**: 200/204
- **Test Cases**:
  - [ ] Delete existing product successfully
  - [ ] Delete non-existent product returns 404
  - [ ] Verify product is removed from database

---

## 2. Orders Endpoints

### GET /orders
- **Expected Status**: 200
- **Test Cases**:
  - [ ] Retrieve all orders
  - [ ] Verify order structure (id, userId, items, total, status)

### POST /orders
- **Expected Status**: 201
- **Required Fields**: userId, items, total
- **Test Cases**:
  - [ ] Create order with valid data
  - [ ] Create order with invalid user ID returns 400
  - [ ] Verify order total calculation

### GET /orders/:id
- **Expected Status**: 200
- **Test Cases**:
  - [ ] Get order by valid ID
  - [ ] Get non-existent order returns 404

---

## 3. Users Endpoints

### GET /users
- **Expected Status**: 200
- **Test Cases**:
  - [ ] Retrieve all users

### GET /users/:id
- **Expected Status**: 200
- **Test Cases**:
  - [ ] Get user by valid ID
  - [ ] Get non-existent user returns 404

---

## Error Handling Tests

- [ ] Invalid endpoint returns 404
- [ ] Malformed request body returns 400
- [ ] Unauthorized requests return 401 (if auth required)
- [ ] Server errors return 500+

---

## Performance Tests

- [ ] API responds within 500ms
- [ ] Large product list returns in reasonable time
- [ ] Database queries are optimized
