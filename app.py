from flask import Flask, jsonify, request
from flask_cors import CORS
import MySQLdb

app = Flask(__name__)
CORS(app)

# MySQL configurations
app.config['MYSQL_HOST'] = '127.0.0.1'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '25Vansh25@'
app.config['MYSQL_DB'] = 'dbms'

def get_db_connection():
    conn = MySQLdb.connect(
        host=app.config['MYSQL_HOST'],
        user=app.config['MYSQL_USER'],
        password=app.config['MYSQL_PASSWORD'],
        db=app.config['MYSQL_DB']
    )
    return conn

@app.route('/items', methods=['GET'])
def get_items():
    conn = get_db_connection()
    cursor = conn.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute('SELECT * FROM items')
    items = cursor.fetchall()
    conn.close()
    return jsonify(items)

@app.route('/add', methods=['POST'])
def add_item():
    data = request.get_json()
    name = data['name']
    description = data['description']
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO items (name, description) VALUES (%s, %s)', (name, description))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/update/<int:id>', methods=['POST'])
def update_item(id):
    data = request.get_json()
    name = data['name']
    description = data['description']
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE items SET name = %s, description = %s WHERE id = %s', (name, description, id))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'})

@app.route('/delete/<int:id>', methods=['POST'])
def delete_item(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM items WHERE id = %s', (id,))
    conn.commit()
    conn.close()
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True)
