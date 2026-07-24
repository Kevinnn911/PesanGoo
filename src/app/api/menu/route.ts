// File: src/app/api/menu/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        menuItems: {
          where: {
            ...(categoryId ? { categoryId } : {}),
            ...(search
              ? {
                  OR: [
                    { name: { contains: search } },
                    { description: { contains: search } },
                  ],
                }
              : {}),
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Fetch menu error:', error);
    return NextResponse.json({ error: 'Gagal mengambil menu' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { categoryId, name, description, price, imageUrl, stock, isAvailable } = body;

    if (!categoryId || !name || price === undefined) {
      return NextResponse.json({ error: 'Kategori, nama, dan harga wajib diisi' }, { status: 400 });
    }

    const newItem = await prisma.menuItem.create({
      data: {
        categoryId,
        name,
        description,
        price: parseFloat(price),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        stock: stock ? parseInt(stock) : 100,
        isAvailable: isAvailable ?? true,
      },
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error('Create menu error:', error);
    return NextResponse.json({ error: 'Gagal menambah menu' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, categoryId, name, description, price, imageUrl, stock, isAvailable } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID menu tidak ditemukan' }, { status: 400 });
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        ...(categoryId ? { categoryId } : {}),
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(price !== undefined ? { price: parseFloat(price) } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(stock !== undefined ? { stock: parseInt(stock) } : {}),
        ...(isAvailable !== undefined ? { isAvailable } : {}),
      },
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error('Update menu error:', error);
    return NextResponse.json({ error: 'Gagal mengubah menu' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID menu wajib diisi' }, { status: 400 });
    }

    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Menu berhasil dihapus' });
  } catch (error) {
    console.error('Delete menu error:', error);
    return NextResponse.json({ error: 'Gagal menghapus menu' }, { status: 500 });
  }
}
