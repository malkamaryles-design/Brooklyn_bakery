# Brooklyn Bakery — מפת ארכיטקטורה ותהליכים

## איפה הקריאות לשרת נמצאות?

כל הקריאות לשרת מרוכזות בתיקייה:
```
client/src/services/
├── apiClient.js       ← המנוע המרכזי (fetch wrapper + JWT אוטומטי)
├── authService.js     ← הרשמה, התחברות, פרופיל
├── orderService.js    ← הזמנות
├── productService.js  ← מוצרים + עגלה + ניהול מוצרים (admin)
```

`apiClient.js` הוא "המתורגמן" — כל service קורא לו, והוא מצרף את ה-token, שולח את הבקשה, ומחזיר את התשובה.

---

## מיפוי תהליכים — Client → Server

### 1. הרשמה (Register)

| שכבה | קובץ | פונקציה |
|-------|------|---------|
| UI (כפתור) | `AuthForm.jsx` | `handleSubmit` → calls `registerUser(name, email, password)` |
| Service | `authService.js` | `registerUser` → `apiPost('/api/auth/register', {...})` |
| API Client | `apiClient.js` | `apiPost` → `fetch(url, { method: 'POST', body, headers+token })` |
| Route (server) | `authRoutes.js` | `POST /register` → `register` controller |
| Controller | `authController.js` | `register` → validates → `User.create()` → `signToken()` → response |
| Model | `userModel.js` | saves to MongoDB `users` collection |

---

### 2. התחברות (Login)

| שכבה | קובץ | פונקציה |
|-------|------|---------|
| UI | `AuthForm.jsx` | `handleSubmit` → `loginUser(email, password)` |
| Service | `authService.js` | `loginUser` → `apiPost('/api/auth/login', {...})` |
| Route | `authRoutes.js` | `POST /login` → `login` |
| Controller | `authController.js` | `login` → finds user → compares password → `signToken()` |

---

### 3. שחזור session (getMe)

| שכבה | קובץ | פונקציה |
|-------|------|---------|
| Context (on mount) | `AuthContext.jsx` | `useEffect` → `getMe()` |
| Service | `authService.js` | `getMe` → `apiGet('/api/auth/me')` |
| Route | `authRoutes.js` | `GET /me` (auth middleware) → `me` |
| Controller | `authController.js` | `me` → `User.findById(req.user.userId)` |

---

### 4. עדכון פרופיל

| שכבה | קובץ | פונקציה |
|-------|------|---------|
| UI | `AccountPage.jsx` | `handleProfileSave` → `updateProfile(profileForm)` |
| Service | `authService.js` | `updateProfile` → `apiPatch('/api/auth/profile', data)` |
| Route | `authRoutes.js` | `PATCH /profile` (auth middleware) → `updateProfile` |
| Controller | `authController.js` | `updateProfile` → `User.findByIdAndUpdate(...)` |

---

### 5. טעינת מוצרים

| שכבה | קובץ | פונקציה |
|-------|------|---------|
| UI | `ShopPage.jsx` / `AdminPage.jsx` | `useEffect` → `getProducts()` |
| Service | `productService.js` | `getProducts` → `apiGet('/api/products')` |
| Route | `productRoutes.js` | `GET /` → `getProducts` |
| Controller | `productController.js` | `getProducts` → `productService.getAllProducts()` |
| Service (server) | `productService.js` | `getAllProducts` → `productModel.fetchAll()` |
| Model | `productModel.js` | `Product.find({})` |

---

### 6. הוספה לעגלה

| שכבה | קובץ | פונקציה |
|-------|------|---------|
| UI | `ShopPage.jsx` | `handleAdd` → `addItem(product, 1)` |
| Context | `CartContext.jsx` | `addItem` → if logged in: `apiAddToCart(productId, qty)` |
| Service | `productService.js` | `addToCart` → `apiPost('/api/products/cart', {...})` |
| Route | `productRoutes.js` | `POST /cart` (auth) → `addToCart` |
| Controller | `productController.js` | `addToCart` → `productService.addToCart(userId, productId, qty)` |
| Service (server) | `productService.js` | validates → `cartModel.upsertItem(...)` |
| Model | `cartModel.js` | `Cart.findOne` + update or `Cart.create` |

---

### 7. הסרה מעגלה

| שכבה | קובץ | פונקציה |
|-------|------|---------|
| UI | `CartPage.jsx` | `removeItem(cartItemId)` |
| Context | `CartContext.jsx` | `removeItem` → `apiRemoveFromCart(cartItemId)` |
| Service | `productService.js` | `removeFromCart` → `apiDelete('/api/products/cart/:id')` |
| Route | `productRoutes.js` | `DELETE /cart/:itemId` (auth) → `removeFromCart` |
| Controller | `productController.js` | → `productService.removeFromCart(userId, itemId)` |
| Model | `cartModel.js` | `Cart.findOneAndDelete(...)` |

---

### 8. עדכון כמות בעגלה

| שכבה | קובץ | פונקציה |
|-------|------|---------|
| UI | `CartPage.jsx` | `changeQuantity(cartItemId, qty)` |
| Context | `CartContext.jsx` | `changeQuantity` → `apiUpdateQuantity(cartItemId, qty)` |
| Service | `productService.js` | `updateQuantity` → `apiPatch('/api/products/cart/:id', { quantity })` |
| Route | `productRoutes.js` | `PATCH /cart/:itemId` (auth) → `updateQuantity` |
| Controller/Model | → `cartModel.setQuantity(...)` |

---

### 9. ביצוע הזמנה (Place Order)

| שכבה | קובץ | פונקציה |
|-------|------|---------|
| UI | `CheckoutPage.jsx` | `handleSubmit` → `placeOrder({ customer, delivery })` |
| Service | `orderService.js` | `placeOrder` → `apiPost('/api/orders', orderData)` |
| Route | `orderRoutes.js` | `POST /` (auth) → `placeOrder` |
| Controller | `orderController.js` | validates → loads cart from DB → creates order → clears cart → sends email |
| Model | `orderModel.js` | `Order.create(...)` |
| Service | `emailService.js` | `sendOrderConfirmation(order)` — via Gmail/Nodemailer |

---

### 10. הזמנות שלי (My Orders)

| שכבה | קובץ | פונקציה |
|-------|------|---------|
| UI | `AccountPage.jsx` | `useFetch(getMyOrders)` |
| Service | `orderService.js` | `getMyOrders` → `apiGet('/api/orders/mine')` |
| Route | `orderRoutes.js` | `GET /mine` (auth) → `getMyOrders` |
| Controller | `orderController.js` | `Order.find({ userId })` |

---

### 11. כל ההזמנות — Admin

| שכבה | קובץ | פונקציה |
|-------|------|---------|
| UI | `AdminPage.jsx` | `loadOrders` → `getAllOrders()` |
| Service | `orderService.js` | `getAllOrders` → `apiGet('/api/orders')` |
| Route | `orderRoutes.js` | `GET /` (auth + admin) → `getAllOrders` |
| Controller | `orderController.js` | `Order.find().populate('userId')` |

---

### 12. עדכון סטטוס הזמנה — Admin

| שכבה | קובץ | פונקציה |
|-------|------|---------|
| UI | `AdminPage.jsx` | `handleStatusChange(orderId, status)` |
| Service | `orderService.js` | `updateOrderStatus` → `apiPatch('/api/orders/:id/status', { status })` |
| Route | `orderRoutes.js` | `PATCH /:id/status` (auth + admin) → `updateOrderStatus` |
| Controller | `orderController.js` | validates status → `Order.findByIdAndUpdate(...)` |

---

### 13. ניהול מוצרים — Admin (Create / Update / Delete)

| פעולה | Client Service | Endpoint | Controller |
|--------|---------------|----------|------------|
| יצירת מוצר | `createProduct(data)` | `POST /api/admin/products` | `adminController.createProduct` |
| עדכון מוצר | `updateProduct(id, data)` | `PUT /api/admin/products/:id` | `adminController.updateProduct` |
| מחיקת מוצר | `deleteProduct(id)` | `DELETE /api/admin/products/:id` | `adminController.deleteProduct` |

---

## תרשים זרימה כללי

```
User Action (click / submit)
    ↓
React Component (Page / Context)
    ↓
Service Layer (client/src/services/*.js)
    ↓
apiClient.js (attaches JWT, sends fetch)
    ↓
Express Route (server/routes/*.js)
    ↓
Middleware (authMiddleware → adminMiddleware)
    ↓
Controller (server/controllers/*.js)
    ↓
Service / Model (business logic + DB)
    ↓
MongoDB (Brooklyn_Bakery)
    ↓
Response → apiClient parses → Component updates state → UI re-renders
```

---

## עגלה אנונימית (Guest Cart)

כשהמשתמש **לא מחובר**:
- העגלה נשמרת ב-`localStorage` (key: `bakery_guest_cart`)
- אין קריאות לשרת — הכל local
- כש**מתחבר** — `CartContext` שולח את כל הפריטים לשרת (`addToCart` per item), מנקה localStorage, וטוען את העגלה המאוחדת

---

## אימות (Authentication Flow)

- Token נשמר ב-`localStorage` (key: `token`)
- `apiClient.js` מצרף אותו **אוטומטית** לכל request בheader: `Authorization: Bearer <token>`
- Server: `authMiddleware` מאמת → מוסיף `req.user = { userId, role }`
- `adminMiddleware` בודק `req.user.role === 'admin'`
