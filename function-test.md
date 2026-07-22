# Function Test Cases

## Overview
Test cases for core functions in Teddy Bear Shop

---

## Product Functions

### getProductById(id)
- [ ] Returns product object when ID exists
- [ ] Returns null when ID doesn't exist
- [ ] Handles invalid ID format gracefully
- [ ] Performance: executes in < 100ms

### getAllProducts()
- [ ] Returns array of all products
- [ ] Array is not empty (has products)
- [ ] Each product has required properties
- [ ] Results are properly sorted

### addProduct(data)
- [ ] Creates product with valid data
- [ ] Assigns unique ID to new product
- [ ] Validates required fields (name, price, description)
- [ ] Throws error on invalid price (negative or non-numeric)
- [ ] Returns created product object

### updateProduct(id, data)
- [ ] Updates existing product successfully
- [ ] Returns updated product object
- [ ] Throws error when product ID doesn't exist
- [ ] Validates price field if being updated
- [ ] Preserves unmodified fields

### deleteProduct(id)
- [ ] Deletes product when ID exists
- [ ] Returns true on successful deletion
- [ ] Returns false when product doesn't exist
- [ ] Removes product from database
- [ ] Cascades delete to related orders

### filterProducts(criteria)
- [ ] Filters by price range correctly
- [ ] Filters by category correctly
- [ ] Combines multiple filters
- [ ] Returns empty array when no matches
- [ ] Performance with large datasets

---

## Order Functions

### createOrder(userId, items)
- [ ] Creates order with valid user ID
- [ ] Calculates total price correctly
- [ ] Items array is not empty
- [ ] Validates item quantities (> 0)
- [ ] Throws error for invalid user ID
- [ ] Assigns unique order ID

### getOrderById(orderId)
- [ ] Returns order object when ID exists
- [ ] Returns null when ID doesn't exist
- [ ] Includes all order items
- [ ] Includes customer information

### getOrdersByUserId(userId)
- [ ] Returns all orders for user
- [ ] Returns empty array when user has no orders
- [ ] Orders are sorted by date (newest first)
- [ ] Handles invalid user ID gracefully

### updateOrderStatus(orderId, status)
- [ ] Updates order status to valid values (pending, shipped, delivered)
- [ ] Rejects invalid status values
- [ ] Returns updated order object
- [ ] Throws error for non-existent order ID

### calculateOrderTotal(items)
- [ ] Calculates sum correctly
- [ ] Applies discounts if applicable
- [ ] Handles tax calculation
- [ ] Returns number with 2 decimal places

---

## User Functions

### createUser(email, password, name)
- [ ] Creates user with valid data
- [ ] Validates email format
- [ ] Validates password strength (min 8 chars, uppercase, number)
- [ ] Hashes password before storing
- [ ] Throws error on duplicate email
- [ ] Returns user object (without password)

### getUserById(userId)
- [ ] Returns user object when ID exists
- [ ] Returns null when ID doesn't exist
- [ ] Does not return password field
- [ ] Includes user profile data

### authenticateUser(email, password)
- [ ] Returns true for correct credentials
- [ ] Returns false for incorrect password
- [ ] Returns false for non-existent email
- [ ] Handles case-insensitive email

### updateUserProfile(userId, data)
- [ ] Updates name successfully
- [ ] Updates email successfully
- [ ] Updates phone successfully
- [ ] Validates email format when updating
- [ ] Prevents duplicate email
- [ ] Throws error for non-existent user

### deleteUser(userId)
- [ ] Deletes user successfully
- [ ] Returns true on success
- [ ] Cascades delete to related orders
- [ ] Removes user profile data

---

## Validation Functions

### validateEmail(email)
- [ ] Returns true for valid emails
- [ ] Returns false for invalid format
- [ ] Accepts standard email patterns
- [ ] Rejects empty string

### validatePassword(password)
- [ ] Requires minimum 8 characters
- [ ] Requires uppercase letter
- [ ] Requires number
- [ ] Returns detailed error messages

### validatePrice(price)
- [ ] Returns true for positive numbers
- [ ] Returns false for negative numbers
- [ ] Returns false for non-numeric values
- [ ] Handles decimal values

---

## Utility Functions

### formatCurrency(amount)
- [ ] Formats number to 2 decimal places
- [ ] Adds currency symbol
- [ ] Handles large numbers
- [ ] Handles zero and negative values

### formatDate(date)
- [ ] Returns formatted date string
- [ ] Handles different date formats
- [ ] Returns readable format (e.g., "Jan 20, 2026")

### calculateDiscount(price, discountPercent)
- [ ] Calculates discount correctly
- [ ] Returns number with 2 decimal places
- [ ] Handles 0% discount
- [ ] Validates discount percent (0-100)

---

## Error Handling

- [ ] All functions throw appropriate errors
- [ ] Error messages are descriptive
- [ ] Null/undefined inputs handled gracefully
- [ ] No silent failures
