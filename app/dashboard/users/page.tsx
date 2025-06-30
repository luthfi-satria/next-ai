// app/page.tsx
'use client'; // Pastikan ini ada jika menggunakan React hooks dan interaktivitas

import { useState, useEffect } from 'react';
import { User } from '@/models/interfaces/users.interfaces'; // Sesuaikan path jika berbeda
import { ObjectId } from 'mongodb';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (response.ok && data.success) {
        setUsers(data.data as User[]);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <p className="text-xl font-semibold text-gray-700">Loading users...</p>
    </div>
  );
  if (error) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <p className="text-xl font-semibold text-red-600">Error: {error}</p>
    </div>
  );

  const handleDelete = (userId: ObjectId) => {
    console.log(`delete ${userId}`)
    return true
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8">User Management Dashboard</h1>
        {/* Tombol Tambah User */}
        <div className="mb-6">
          <Link
            href="/dashboard/users/add"
            className="py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out"
          >
            ✨ Add New User
          </Link>
        </div>

        {/* Tabel User List */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-5 mt-8">Registered Users</h2>
        {users.length === 0 ? (
          <div className="text-gray-600 text-center py-8 text-lg bg-gray-50 rounded-lg border border-gray-200">
            <p>No users found. Click "Add New User" to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  {/* Tambahkan kolom lain jika diperlukan, misal: <th ...>Actions</th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user, key) => (
                  <tr key={`user_${key}`} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-semibold text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{user.email}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        className="text-indigo-600 hover:text-indigo-900 mr-4" 
                        href={`/dashboard/users/details/${user._id}`}
                        replace={true}
                      >Edit</Link>
                      <button className="text-red-600 hover:text-red-900" onClick={ () => handleDelete(user._id)}>Delete</button>
                    </td>
                   
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}