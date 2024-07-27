'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [items, setItems] = useState([]);
  const [complexQueries, setComplexQueries] = useState({});
  const [updateMode, setUpdateMode] = useState(null);
  const [updateName, setUpdateName] = useState('');
  const [updateCategory, setUpdateCategory] = useState('');
  const [updatePrice, setUpdatePrice] = useState('');
  const [orders, setOrders] = useState([]);
  const [updateOrderMode, setUpdateOrderMode] = useState(null);
  const [updateProductId, setUpdateProductId] = useState('');
  const [updateQuantity, setUpdateQuantity] = useState('');
  const [updateOrderDate, setUpdateOrderDate] = useState('');
  const [updateOrderFields, setUpdateOrderFields] = useState({});

  const handleUpdateOrderFieldChange = (orderId, field, value) => {
    setUpdateOrderFields(prevState => ({
      ...prevState,
      [orderId]: {
        ...prevState[orderId],
        [field]: value
      }
    }));
  };

  const handleUpdateOrder = async (orderId) => {
    const orderFields = updateOrderFields[orderId];

    if (!orderFields) {
      console.error(`No fields to update for order ID: ${orderId}`);
      return;
    }

    const { product_id, quantity, order_date } = orderFields;

    if (!product_id || !quantity || !order_date) {
      console.error(`Missing fields for order ID: ${orderId}`);
      return;
    }

    await fetch(`http://127.0.0.1:5000/update_order/${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id,
        quantity,
        order_date,
      }),
    }).then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          fetchOrders();
          setUpdateOrderMode(null);
        } else {
          console.error('Failed to update order:', data.message);
        }
      })
      .catch(error => console.error('Error:', error));
  };




  const handleDeleteOrder = async (orderId) => {
    await fetch(`http://127.0.0.1:5000/delete_order/${orderId}`, {
      method: 'POST',
    }).then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          fetchOrders();
        } else {
          console.log('Failed to delete order:', data.message);
        }
      })
      .catch(error => console.error('Error:', error));
  };



  const fetchOrders = () => {
    fetch('http://127.0.0.1:5000/orders')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched Orders:', data); // Log the fetched data
        setOrders(data);
      })
      .catch(error => console.error('Error fetching orders:', error));
  };

  const fetchItems = () => {
    fetch('http://127.0.0.1:5000/items')
      .then(response => response.json())
      .then(data => setItems(data))
      .catch(error => console.error('Error fetching data:', error));
  };

  const fetchComplexQueries = () => {
    fetch('http://127.0.0.1:5000/complex_queries')
      .then(response => response.json())
      .then(data => setComplexQueries(data))
      .catch(error => console.error('Error fetching complex queries:', error));
  };

  useEffect(() => {
    fetchItems();
    fetchComplexQueries();
    fetchOrders();
    const interval = setInterval(() => {
      fetchItems();
      fetchOrders();
    }, 60000); // Fetch every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const handleAddItem = async (event) => {
    event.preventDefault();
    const name = event.target.name.value;
    const category = event.target.category.value;
    const price = event.target.price.value;

    await fetch('http://127.0.0.1:5000/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, category, price }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          fetchItems();
          fetchComplexQueries();  // Refresh complex queries
        } else {
          console.error('Failed to add item');
        }
      })
      .catch(error => console.error('Error:', error));
  };

  const handleUpdateClick = (id, name, category, price) => {
    setUpdateMode(id);
    setUpdateName(name);
    setUpdateCategory(category);
    setUpdatePrice(price);
  };

  const handleUpdateSubmit = async (id) => {
    await fetch(`http://127.0.0.1:5000/update/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: updateName, category: updateCategory, price: updatePrice }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          fetchItems();
          setUpdateMode(null);
          fetchComplexQueries();  // Refresh complex queries
        } else {
          console.error('Failed to update item');
        }
      })
      .catch(error => console.error('Error:', error));
  };

  const handleDeleteItem = async (id) => {
    await fetch(`http://127.0.0.1:5000/delete/${id}`, {
      method: 'POST',
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          fetchItems();
          fetchComplexQueries();  // Refresh complex queries
        } else {
          console.error('Failed to delete item');
        }
      })
      .catch(error => console.error('Error:', error));
  };

  const renderProducts = () => (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Products</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border">Product ID</th>
            <th className="py-2 px-4 border">Name</th>
            <th className="py-2 px-4 border">Category</th>
            <th className="py-2 px-4 border">Price</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border">{item.product_id}</td>
              <td className="py-2 px-4 border">{item.name}</td>
              <td className="py-2 px-4 border">{item.category}</td>
              <td className="py-2 px-4 border">${item.price}</td>
              <td className="py-2 px-4 border">
                {updateMode === item.product_id ? (
                  <div className="flex flex-col space-y-2">
                    <input type="text" value={updateName} onChange={(e) => setUpdateName(e.target.value)} className="border p-2 rounded w-full bg-white text-gray-800" />
                    <input type="text" value={updateCategory} onChange={(e) => setUpdateCategory(e.target.value)} className="border p-2 rounded w-full bg-white text-gray-800" />
                    <input type="text" value={updatePrice} onChange={(e) => setUpdatePrice(e.target.value)} className="border p-2 rounded w-full bg-white text-gray-800" />
                    <button onClick={() => handleUpdateSubmit(item.product_id)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Update</button>
                  </div>
                ) : (
                  <div className="flex space-x-6">
                    <button onClick={() => handleUpdateClick(item.product_id, item.name, item.category, item.price)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Want to update?</button>
                    <button onClick={() => handleDeleteItem(item.product_id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Delete</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  const renderOrders = () => (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Orders</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border">Order ID</th>
            <th className="py-2 px-4 border">Product ID</th>
            <th className="py-2 px-4 border">Quantity</th>
            <th className="py-2 px-4 border">Order Date</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border">{order.order_id}</td>
              <td className="py-2 px-4 border">{order.product_id}</td>
              <td className="py-2 px-4 border">{order.quantity}</td>
              <td className="py-2 px-4 border">{order.order_date}</td>
              <td className="py-2 px-4 border">
                {updateOrderMode === order.order_id ? (
                  <div className="flex flex-col space-y-2">
                    <input
                      type="text"
                      value={updateOrderFields[order.order_id]?.product_id || ''}
                      onChange={(e) => handleUpdateOrderFieldChange(order.order_id, 'product_id', e.target.value)}
                      className="border p-2 rounded w-full bg-white text-gray-800"
                      placeholder="Product ID"
                    />
                    <input
                      type="text"
                      value={updateOrderFields[order.order_id]?.quantity || ''}
                      onChange={(e) => handleUpdateOrderFieldChange(order.order_id, 'quantity', e.target.value)}
                      className="border p-2 rounded w-full bg-white text-gray-800"
                      placeholder="Quantity"
                    />
                    <input
                      type="text"
                      value={updateOrderFields[order.order_id]?.order_date || ''}
                      onChange={(e) => handleUpdateOrderFieldChange(order.order_id, 'order_date', e.target.value)}
                      className="border p-2 rounded w-full bg-white text-gray-800"
                      placeholder="Order Date"
                    />
                    <button onClick={() => handleUpdateOrder(order.order_id)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Update</button>
                  </div>
                ) : (
                  <div className="flex space-x-6">
                    <button onClick={() => {
                      setUpdateOrderMode(order.order_id);
                      setUpdateOrderFields(prevState => ({
                        ...prevState,
                        [order.order_id]: {
                          product_id: order.product_id,
                          quantity: order.quantity,
                          order_date: order.order_date
                        }
                      }));
                    }} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Want to update?</button>
                    <button onClick={() => handleDeleteOrder(order.order_id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Delete</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );



  const renderQueryResults = (title, results) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            {results.length > 0 && Object.keys(results[0]).map(key => (
              <th key={key} className="py-2 px-4 border">{key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, idx) => (
                <td key={idx} className="py-2 px-4 border">{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <Head>
        <title>My Custom App Title</title>
      </Head>
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">DBMS - Deliverable 4</h1>
      <form onSubmit={handleAddItem} className="flex flex-col items-center mb-8 space-y-4">
        <input type="text" name="name" placeholder="Item Name" required className="border p-2 rounded w-80 bg-white text-gray-800" />
        <input type="text" name="category" placeholder="Item Category" className="border p-2 rounded w-80 bg-white text-gray-800" />
        <input type="text" name="price" placeholder="Item Price" className="border p-2 rounded w-80 bg-white text-gray-800" />
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add Item</button>
      </form>
      {renderProducts()}
      {renderOrders()}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Complex Queries Results</h2>
        {renderQueryResults('Set Operation: UNION', complexQueries.union_result || [])}
        {renderQueryResults('Set Membership: IN', complexQueries.in_result || [])}
        {renderQueryResults('Set Comparison: EXISTS', complexQueries.exists_result || [])}
        {renderQueryResults('Subqueries using WITH clause', complexQueries.with_clause_result || [])}
        {renderQueryResults('Advanced Aggregate Functions', complexQueries.aggregate_result || [])}
        {renderQueryResults('OLAP Queries: Window Functions', complexQueries.olap_result || [])}
      </div>
    </div>
  );
}
