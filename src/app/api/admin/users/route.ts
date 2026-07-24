// File: src/app/api/admin/users/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Gagal mengambil pengguna' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, username, email, password, role } = body;

    if (!name || !username || !password || !role) {
      return NextResponse.json({ error: 'Data pengguna tidak lengkap' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const defaultOutlet = await prisma.outlet.findFirst();

    const newUser = await prisma.user.create({
      data: {
        name,
        username,
        email: email || null,
        passwordHash,
        role,
        outletId: defaultOutlet?.id,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Gagal membuat pengguna' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID pengguna wajib diisi' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Pengguna berhasil dihapus' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Gagal menghapus pengguna' }, { status: 500 });
  }
}
