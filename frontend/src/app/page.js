'use client';
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [items, setItems] = useState([]);
  const [updateMode, setUpdateMode] = useState(null);
  const [updateName, setUpdateName] = useState('');
  const [updateDescription, setUpdateDescription] = useState('');

  const fetchItems = () => {
    fetch('http://127.0.0.1:5000/items')
      .then(response => response.json())
      .then(data => setItems(data))
      .catch(error => console.error('Error fetching data:', error));
  };

  useEffect(() => {
    fetchItems();
    const interval = setInterval(() => {
      fetchItems();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAddItem = async (event) => {
    event.preventDefault();
    const name = event.target.name.value;
    const description = event.target.description.value;

    await fetch('http://127.0.0.1:5000/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          fetchItems();
        } else {
          console.error('Failed to add item');
        }
      })
      .catch(error => console.error('Error:', error));
  };

  const handleUpdateClick = (id, name, description) => {
    setUpdateMode(id);
    setUpdateName(name);
    setUpdateDescription(description);
  };

  const handleUpdateSubmit = async (id) => {
    await fetch(`http://127.0.0.1:5000/update/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: updateName, description: updateDescription }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          fetchItems();
          setUpdateMode(null);
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
        } else {
          console.error('Failed to delete item');
        }
      })
      .catch(error => console.error('Error:', error));
  };

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <Head>
        <title>My Custom App Title</title>
      </Head>
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">DBMS - Deliverable 4</h1>
      <form onSubmit={handleAddItem} className="flex flex-col items-center mb-8 space-y-4">
        <input type="text" name="name" placeholder="Item Name" required className="border p-2 rounded w-80 bg-white text-gray-800" />
        <input type="text" name="description" placeholder="Item Description" className="border p-2 rounded w-80 bg-white text-gray-800" />
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add Item</button>
      </form>
      <ul className="space-y-4">
        {items.map(item => (
          <li key={item.id} className="p-4 border rounded shadow-lg bg-white text-gray-800">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold">{item.name}</span> - {item.description}
              </div>
              <div className="space-x-2">
                {updateMode === item.id ? (
                  <div className="flex flex-col space-y-2">
                    <input type="text" value={updateName} onChange={(e) => setUpdateName(e.target.value)} className="border p-2 rounded w-full bg-white text-gray-800" />
                    <input type="text" value={updateDescription} onChange={(e) => setUpdateDescription(e.target.value)} className="border p-2 rounded w-full bg-white text-gray-800" />
                    <button onClick={() => handleUpdateSubmit(item.id)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Update</button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => handleUpdateClick(item.id, item.name, item.description)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Want to update?</button>
                    <button onClick={() => handleDeleteItem(item.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Delete</button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
