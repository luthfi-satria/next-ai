// pages/api/users/[id]/route.ts
import { getMongoCollection } from '@/library/mongodb';
import { User } from '@/models/interfaces/users.interfaces';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: {
    id: string;
  };
}
export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params

        const usersCollection = await getMongoCollection<User>('users');
        const user = await usersCollection.findOne({_id: new ObjectId(id)})

        if(!user){
            return NextResponse.json( { success: false, message: 'User not found'})
        }

        return NextResponse.json({ success: true, data: user }, { status: 200 });
    } catch (error: any) {
        console.error('Error in GET /api/users/[id]:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch users', error: error.message }, { status: 500 });
    }
}