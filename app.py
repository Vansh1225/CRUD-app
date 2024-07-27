from flask import Flask, request, jsonify
from flask_cors import CORS
import MySQLdb

app = Flask(__name__)
CORS(app)

def connect_db():
    return MySQLdb.connect(host="127.0.0.1", user="root", passwd="25Vansh25@", db="ecommerce")

@app.route('/items', methods=['GET'])
def get_items():
    db = connect_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM products")
    rows = cursor.fetchall()
    items = []
    for row in rows:
        items.append({"product_id": row[0], "name": row[1], "category": row[2], "price": row[3]})
    db.close()
    return jsonify(items)

@app.route('/orders', methods=['GET'])
def get_orders():
    db = connect_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM orders")
    orders = cursor.fetchall()
    cursor.close()
    return jsonify([{
        'order_id': row[0],
        'product_id': row[1],
        'quantity': row[2],
        'order_date': row[3].strftime('%Y-%m-%d')
    } for row in orders])
@app.route('/update_order/<int:order_id>', methods=['POST'])
def update_order(order_id):
    db = connect_db()
    data = request.json
    cursor = db.cursor()
    try:
        cursor.execute(
            "UPDATE orders SET product_id = %s, quantity = %s, order_date = %s WHERE order_id = %s",
            (data['product_id'], data['quantity'], data['order_date'], order_id)
        )
        db.commit()
        return jsonify({'status': 'success'})
    except MySQLdb.IntegrityError as e:
        db.rollback()
        return jsonify({'status': 'fail', 'message': str(e)}), 500
    finally:
        cursor.close()
        db.close()

@app.route('/delete_order/<int:order_id>', methods=['POST'])
def delete_order(order_id):
    db = connect_db()
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM orders WHERE order_id = %s", (order_id,))
        db.commit()
        return jsonify({'status': 'success'})
    except MySQLdb.IntegrityError as e:
        db.rollback()
        return jsonify({'status': 'fail', 'message': str(e)}), 500
    finally:
        cursor.close()
        db.close()

# @app.route('/orders', methods=['GET'])
# def get_orders():
#     cursor = db.cursor()
#     cursor.execute("SELECT * FROM orders")
#     orders = cursor.fetchall()
    

@app.route('/add', methods=['POST'])
def add_item():
    data = request.json
    db = connect_db()
    cursor = db.cursor()
    cursor.execute("INSERT INTO products (name, category, price) VALUES (%s, %s, %s)", (data['name'], data['category'], data['price']))
    db.commit()
    db.close()
    return jsonify({"status": "success"})

@app.route('/update/<int:id>', methods=['POST'])
def update_item(id):
    data = request.json
    db = connect_db()
    cursor = db.cursor()
    cursor.execute("UPDATE products SET name = %s, category = %s, price = %s WHERE product_id = %s", (data['name'], data['category'], data['price'], id))
    db.commit()
    db.close()
    return jsonify({"status": "success"})

@app.route('/delete/<int:id>', methods=['POST'])
def delete_item(id):
    db = connect_db()
    cursor = db.cursor()
    
    # Delete orders associated with the product
    cursor.execute('DELETE FROM orders WHERE product_id = %s', (id,))
    
    # Delete the product
    cursor.execute('DELETE FROM products WHERE product_id = %s', (id,))
    
    db.commit()
    db.close()
    return jsonify({"status": "success"})

@app.route('/complex_queries', methods=['GET'])
def complex_queries():
    db = connect_db()
    cursor = db.cursor()

    cursor.execute('SELECT category, name, price, product_id FROM products UNION SELECT category, name, price, product_id FROM products')
    union_result = cursor.fetchall()

    cursor.execute('SELECT order_date, order_id, product_id, quantity FROM orders WHERE order_date IN (SELECT order_date FROM orders)')
    in_result = cursor.fetchall()

    cursor.execute('SELECT category, name, price, product_id FROM products WHERE EXISTS (SELECT * FROM orders WHERE orders.product_id = products.product_id)')
    exists_result = cursor.fetchall()

    cursor.execute('WITH RankedOrders AS (SELECT *, ROW_NUMBER() OVER (ORDER BY order_date) as row_num FROM orders) SELECT order_date, order_id, product_id, quantity, row_num FROM RankedOrders WHERE row_num <= 3')
    with_clause_result = cursor.fetchall()

    cursor.execute('SELECT category, SUM(price * quantity) as total_sales FROM orders JOIN products ON orders.product_id = products.product_id GROUP BY category')
    aggregate_result = cursor.fetchall()

    cursor.execute('SELECT category, SUM(price * quantity) OVER (PARTITION BY category ORDER BY order_date) as cumulative_sales, order_date FROM orders JOIN products ON orders.product_id = products.product_id')
    olap_result = cursor.fetchall()

    db.close()

    return jsonify({
        "union_result": [{"category": row[0], "name": row[1], "price": row[2], "product_id": row[3]} for row in union_result],
        "in_result": [{"order_date": row[0].strftime('%Y-%m-%d'), "order_id": row[1], "product_id": row[2], "quantity": row[3]} for row in in_result],
        "exists_result": [{"category": row[0], "name": row[1], "price": row[2], "product_id": row[3]} for row in exists_result],
        "with_clause_result": [{"order_date": row[0].strftime('%Y-%m-%d'), "order_id": row[1], "product_id": row[2], "quantity": row[3], "row_num": row[4]} for row in with_clause_result],
        "aggregate_result": [{"category": row[0], "total_sales": row[1]} for row in aggregate_result],
        "olap_result": [{"category": row[0], "cumulative_sales": row[1], "order_date": row[2].strftime('%Y-%m-%d')} for row in olap_result]
    })

if __name__ == '__main__':
    app.run(debug=True)
