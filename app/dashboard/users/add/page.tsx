'use client'
import { APIResponse } from "@/models/interfaces/global.interfaces";
import { NewUser } from "@/models/interfaces/users.interfaces"
import Link from "next/link";
import { useState } from "react";

export default function AddUserPage(){
    const [newUser, setNewUser] = useState<NewUser>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [responseMessage, setResponseMessage] = useState<string | null>(null);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });
            const data: APIResponse = await response.json();

            if (response.ok && data.success) {
                setNewUser({ name: '', email: '' }); // Reset form
                setResponseMessage(data.message);
            } else {
                setError(data.message || 'Failed to add user');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setTimeout(() => {
                setIsSubmitting(false);
                setResponseMessage('');
            }, 5000);
        }
    };

    const handleResponse = () => {
        let message = ''
        let style = ''
        if (error){
            message = `Error: ${error}`
            style = 'text-red-600 bg-red-300 border border-red-500'
        }

        if (responseMessage){
            message = responseMessage
            style = 'text-green-600 bg-green-300 border border-green-500'
        }
        
        return (
            <div className={`h-auto flex bg-gray-50 p-2 mb-3 ${style}`}>
                <p className="text-md">{message}</p>
            </div>
        )
    }
    
    return (
        <>
            {/* Form Tambah User */}
            <div className="w-1/2 bg-white rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
                <div className="flex flex-row gap-2 justify-stretch mb-4">
                    <Link className="w-[100px] p-4 border rounded-md text-center align-middle" href="/dashboard/users">Back</Link>
                    <h2 className="h-full text-xl sm:text-2xl font-bold text-gray-800 p-2 flex-grow">Add New User</h2>
                </div>
                {isSubmitting && handleResponse()}
                <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                    </label>
                    <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="e.g., Jane Doe"
                    value={newUser?.name || ''}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                    </label>
                    <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="e.g., jane.doe@example.com"
                    value={newUser?.email || ''}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Adding User...' : 'Submit User'}
                </button>
                </form>
            </div>
        </>
    )
}