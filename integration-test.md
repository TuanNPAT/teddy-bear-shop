# Integration Test Cases

## Overview
End-to-end integration tests for Teddy Bear Shop workflows

---

## User Registration to Purchase Workflow

### Complete Flow: Register → Login → Browse → Cart → Checkout
- [ ] New user can register successfully
- [ ] User can login with registered credentials
- [ ] User can browse product catalog
- [ ] User can add products to cart
- [ ] Cart total calculates correctly
- [ ] User can proceed to checkout
- [ ] Order is created successfully
- [ ] Confirmation email is sent
- [ ] Order appears in user's order history

### Database Consistency
- [ ] User record created in users table
- [ ] Order record created in orders table
- [ ] Order items linked correctly
- [ ] Inventory updated after purchase
- [ ] Payment status recorded

---

## Shopping Cart Integration

### Add to Cart Flow
- [ ] Product details retrieved correctly
- [ ] Cart item quantity updated
- [ ] Multiple products can be added
- [ ] Cart total recalculates
- [ ] Cart persists across page refresh
- [ ] Remove item updates cart
- [ ] Clear cart empties all items

### Cart to Order Flow
- [ ] Cart items converted to order items
- [ ] Order preserves product information
- [ ] Prices locked at purchase time
- [ ] Tax calculated based on items
- [ ] Shipping cost added correctly

---

## Payment Integration

### VNPay Payment Flow
- [ ] User can select payment method
- [ ] Redirected to VNPay gateway
- [ ] Payment details sent correctly
- [ ] Return URL called after payment
- [ ] Payment status updated in database
- [ ] Order status changes to "paid"
- [ ] Invoice generated

### Payment Failure Handling
- [ ] Failed payment recorded
- [ ] User notified of failure
- [ ] Cart preserved after failure
- [ ] Retry is possible
- [ ] No duplicate orders created

---

## User Profile Integration

### Profile Update Flow
- [ ] User can update profile information
- [ ] Changes saved to database
- [ ] Profile displayed correctly after update
- [ ] Email verification triggered for new email
- [ ] Address book updated
- [ ] Changes reflected in checkout

### Address Management
- [ ] User can add new address
- [ ] User can set default address
- [ ] Address used in checkout
- [ ] Address validation on save
- [ ] User can edit existing address

---

## Order Processing Workflow

### Order Creation to Delivery
- [ ] Order created successfully
- [ ] Inventory reduced from stock
- [ ] Order confirmation sent
- [ ] Order status: "pending"
- [ ] Admin can view order
- [ ] Admin can change status to "processing"
- [ ] Order status: "shipped"
- [ ] Shipping notification sent
- [ ] Order status: "delivered"
- [ ] Delivery notification sent

### Order Tracking
- [ ] User can view order status
- [ ] Tracking history shows all updates
- [ ] Timestamps recorded for each status
- [ ] User receives status notifications

---

## Product Management Integration

### Add Product (Admin) to Display (User)
- [ ] Admin creates new product
- [ ] Product saved to database
- [ ] Product appears in product list
- [ ] User can view product details
- [ ] Product searchable
- [ ] Product can be added to cart

### Update Product (Admin) Flow
- [ ] Admin updates product details
- [ ] Changes saved to database
- [ ] Changes visible to all users
- [ ] Price update affects new carts
- [ ] Existing carts show old price
- [ ] Stock update affects availability

### Delete Product (Admin) Flow
- [ ] Admin can delete product
- [ ] Product removed from catalog
- [ ] Product no longer searchable
- [ ] Existing orders preserved
- [ ] Cart items handled correctly

---

## Search and Filter Integration

### Product Search
- [ ] User searches for product name
- [ ] Results displayed correctly
- [ ] Search case-insensitive
- [ ] Partial matches work
- [ ] No results handled gracefully

### Product Filter
- [ ] Filter by category works
- [ ] Filter by price range works
- [ ] Multiple filters combined
- [ ] Results sorted correctly
- [ ] Pagination works

---

## Admin Dashboard Integration

### Admin Views Orders
- [ ] Admin dashboard loads
- [ ] All orders displayed
- [ ] Filter by status works
- [ ] Filter by date works
- [ ] Sorting works
- [ ] Order detail opens
- [ ] Can update order status

### Admin Manages Products
- [ ] Product list loads
- [ ] Can add new product
- [ ] Can edit product
- [ ] Can delete product
- [ ] Stock updated correctly
- [ ] Price changes visible

### Admin Manages Users
- [ ] User list loads
- [ ] Can view user details
- [ ] Can suspend user
- [ ] Can reactivate user
- [ ] User cannot login when suspended

---

## Notification Integration

### Email Notifications
- [ ] Order confirmation email sent
- [ ] Status update emails sent
- [ ] Password reset email sent
- [ ] Email templates correct
- [ ] Emails received

### In-App Notifications
- [ ] Order status notifications shown
- [ ] Promotion notifications shown
- [ ] User can view notification history
- [ ] Notifications clear properly

---

## Performance Integration

### Load Testing
- [ ] 100 concurrent users browsing
- [ ] Response time < 1 second
- [ ] No database connection errors
- [ ] No memory leaks
- [ ] Proper load balancing

### Stress Testing
- [ ] System handles peak load
- [ ] Graceful degradation
- [ ] Error handling works
- [ ] Recovery after spike

---

## Data Consistency Integration

### Transaction Tests
- [ ] Order creation is atomic
- [ ] Payment and order linked
- [ ] Inventory updates consistent
- [ ] No duplicate orders
- [ ] Rollback on error

### Concurrent Operations
- [ ] Multiple users checkout simultaneously
- [ ] No race conditions
- [ ] Inventory correct
- [ ] Orders processed independently
