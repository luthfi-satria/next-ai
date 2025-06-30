// pages/api/users/route.ts
import elasticsearch from '@/library/elasticsearch';
import { getMongoCollection } from '@/library/mongodb';
import { User } from '@/models/interfaces/users.interfaces';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const usersCollection = await getMongoCollection<User>('users');
        const users = await usersCollection.find({}).toArray(); // Fetch all users

        return NextResponse.json({ success: true, data: users }, { status: 200 });
    } catch (error: any) {
        console.error('Error in GET /api/users:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch users', error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const newUser: User = await req.json();
        
        if (!newUser.name || !newUser.email) { 
            return NextResponse.json({ success: false, message: 'Name and email are required' }, { status: 400 });
        }

        const usersCollection = await getMongoCollection<User>('users');

        const result = await usersCollection.insertOne(newUser);
        const insertedUser = { 
            id: result.insertedId.toHexString(),
            name: newUser.name,
            email: newUser.email,
        }

        // integrate with elasticsearch
        await elasticsearch.indexDocument({
            index: 'users_index',
            id: insertedUser.id,
            document: insertedUser,
        })

        return NextResponse.json({ success: true, data: result.insertedId, message: 'User created successfully' }, { status: 201 });
    } catch (error: any) {
        console.error('Error in POST /api/users:', error);
        return NextResponse.json({ success: false, message: 'Failed to create user', error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest){
    const body = await req.json()

    const id = body._id as ObjectId

    if(!ObjectId.isValid(id)){
        return NextResponse.json( {success: false, message: `Invalid UserId format`})
    }

    delete body._id
    
    const usersCollection = await getMongoCollection<User>('users')
    const result = await usersCollection.findOneAndUpdate({_id: new ObjectId(id)}, { $set: body }, { returnDocument: 'after'})
    
    const esDocument = {
        name: result.name,
        email: result.email,
    }

    await elasticsearch.upsertDocument({
        index: 'users_index',
        id: result._id.toHexString(),
        document: esDocument,
    })

    return NextResponse.json( { success: true, message: `Update success`, data: result }, { status: 200 })
}