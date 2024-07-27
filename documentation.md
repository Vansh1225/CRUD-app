# Inventory Management App

## Overview
The Inventory Management App is a database management system built using Flask for the backend and Next.js for the frontend. This application allows users to manage products and orders, providing a user-friendly interface for CRUD operations and complex SQL queries.

## Features
- **Add, Update, and Delete Products**
- **Add, Update, and Delete Orders**
- **Display Products and Orders in Tables**
- **Complex SQL Queries Results**
- **Robust Error Handling**
- **Responsive and User-Friendly Interface**

## Setup Instructions

### Prerequisites
- Python 3.x
- Node.js and npm
- MySQL

### Backend Setup
1. **Clone the Repository:**
    https://github.com/vansh1225/CRUD-app

2. **Set Up Virtual Environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3. **Install Dependencies:**
    ```bash
    pip install Flask Flask-Cors mysqlclient
    ```

    for Node:
     ```bash
    npm i
    ```

4. **Configure Database:**
    - Ensure MySQL is running and create a database named `ecommerce`.
    - Update the database connection details in the `connect_db` function in `app.py`.

5. **Run the Flask App:**
    ```bash
    python3 app.py
    ```

### Frontend Setup
1. **Navigate to Frontend Directory:**
    ```bash
    cd frontend
    ```

2. **Install Dependencies:**
    ```bash
    npm install
    ```

3. **Run the Next.js App:**
    ```bash
    npm run dev
    ```

## API Endpoints

### Products
- **Get All Products:**
    ```http
    GET /items
    ```
    - Response: JSON array of products.

- **Add Product:**
    ```http
    POST /add
    ```
    - Request Body: `{ "name": "Product Name", "category": "Category", "price": "Price" }`
    - Response: `{ "status": "success" }`

- **Update Product:**
    ```http
    POST /update/<int:id>
    ```
    - Request Body: `{ "name": "Product Name", "category": "Category", "price": "Price" }`
    - Response: `{ "status": "success" }`

- **Delete Product:**
    ```http
    POST /delete/<int:id>
    ```
    - Response: `{ "status": "success" }`

### Orders
- **Get All Orders:**
    ```http
    GET /orders
    ```
    - Response: JSON array of orders.

- **Add Order:**
    ```http
    POST /add_order
    ```
    - Request Body: `{ "product_id": "Product ID", "quantity": "Quantity", "order_date": "YYYY-MM-DD" }`
    - Response: `{ "status": "success" }`

- **Update Order:**
    ```http
    POST /update_order/<int:order_id>
    ```
    - Request Body: `{ "product_id": "Product ID", "quantity": "Quantity", "order_date": "YYYY-MM-DD" }`
    - Response: `{ "status": "success" }`

- **Delete Order:**
    ```http
    POST /delete_order/<int:order_id>
    ```
    - Response: `{ "status": "success" }`

### Complex Queries
- **Get Complex Query Results:**
    ```http
    GET /complex_queries
    ```
    - Response: JSON object with results of complex queries.

## Complex SQL Queries
1. **Union Query:**
    ```sql
    SELECT * FROM products UNION SELECT * FROM orders;
    ```

2. **Set Membership Query:**
    ```sql
    SELECT order_date, order_id, product_id, quantity FROM orders WHERE order_date IN (SELECT order_date FROM orders);
    ```

3. **Set Comparison Query:**
    ```sql
    SELECT category, name, price, product_id FROM products WHERE EXISTS (SELECT * FROM orders WHERE orders.product_id = products.product_id);
    ```

4. **Subqueries using WITH Clause:**
    ```sql
    WITH RankedOrders AS (SELECT *, ROW_NUMBER() OVER (ORDER BY order_date) as row_num FROM orders) SELECT order_date, order_id, product_id, quantity, row_num FROM RankedOrders WHERE row_num <= 3;
    ```

5. **Advanced Aggregate Functions:**
    ```sql
    SELECT category, SUM(price * quantity) as total_sales FROM orders JOIN products ON orders.product_id = products.product_id GROUP BY category;
    ```

6. **OLAP Queries:**
    ```sql
    SELECT category, SUM(price * quantity) OVER (PARTITION BY category ORDER BY order_date) as cumulative_sales, order_date FROM orders JOIN products ON orders.product_id = products.product_id;
    ```

## Error Handling
- All routes include robust error handling to ensure graceful degradation and clear error messages.
- Example:
    ```python
    except MySQLdb.IntegrityError as e:
        db.rollback()
        return jsonify({'status': 'fail', 'message': str(e)}), 500
    ```

## Conclusion
The Inventory Management App demonstrates a comprehensive understanding of database management, user-friendly interface design, and robust error handling. This documentation provides an overview of the app's features, setup instructions, API endpoints, and complex SQL queries.

