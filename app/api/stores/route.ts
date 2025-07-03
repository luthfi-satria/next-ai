import { getMongoCollection } from "@/library/mongodb";
import { Stores } from "@/models/interfaces/stores.interfaces";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
    try {
        const storesCollection = await getMongoCollection<Stores>('stores');
        const stores = await storesCollection.find({}).toArray(); // Fetch all stores

        return NextResponse.json({ success: true, data: stores }, { status: 200 });
    } catch (error: any) {
        console.error('Error in GET /api/stores:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch stores', error: error.message }, { status: 500 });
    }
} 

export async function POST(req: NextRequest){

}

export async function PUT(req: NextRequest){

}

export async function DELETE(req: NextRequest){

}