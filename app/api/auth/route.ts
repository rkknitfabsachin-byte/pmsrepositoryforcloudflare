import { NextRequest, NextResponse } from 'next/server';
import { getUserCredentials } from '@/lib/sheets';
import { isValidRole } from '@/lib/roles';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { name, password } = await request.json();

    if (!name || !password) {
      return NextResponse.json(
        { success: false, error: 'Name and password are required' },
        { status: 400 }
      );
    }

    const users = await getUserCredentials();
    
    // Find matching user (case-insensitive for name, exact match for password)
    const user = users.find(
      (u) => u.name.toLowerCase() === name.toLowerCase() && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid name or password' },
        { status: 401 }
      );
    }

    if (!user.active) {
      return NextResponse.json(
        { success: false, error: 'Your account has been deactivated' },
        { status: 403 }
      );
    }

    const role = isValidRole(user.role) ? user.role : 'VIEWER';

    return NextResponse.json({
      success: true,
      user: {
        id: `sheet-user-${user.name}`,
        name: user.name,
        email: `${user.name.toLowerCase().replace(/\s+/g, '.')}@pms.app`,
        role,
        whatsappNumber: user.whatsapp,
      },
    });
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
