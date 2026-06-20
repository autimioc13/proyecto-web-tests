import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_CATEGORIES = [
  'personality-report',
  'learning-course',
  'certificate',
  'premium-bundle',
  'api-access',
];

/**
 * Verify the request comes from an authenticated admin user.
 * Returns null on success, or a NextResponse error to return early.
 */
async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.substring(7);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (!userRole || userRole.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null;
}

// GET /api/admin/products - list products with pagination, search and category filter
export async function GET(request: NextRequest) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');

    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`id.ilike.%${search}%,title.ilike.%${search}%`);
    }

    const { data: products, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      products: products || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - create a product
export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const body = await request.json();
    const {
      id,
      title,
      description = '',
      category,
      price,
      image = '',
      features = [],
      targetAudience = 'all',
      estimatedValue = '',
      stock = 0,
      isActive = true,
    } = body;

    if (!id || !title || !category || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: id, title, category, price' },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { error: 'Price must be a non-negative number (in cents)' },
        { status: 400 }
      );
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        id,
        title,
        description,
        category,
        price,
        image,
        features,
        target_audience: targetAudience,
        estimated_value: estimatedValue,
        stock,
        is_active: isActive,
      })
      .select()
      .single();

    if (error) {
      // 23505 = unique_violation (duplicate id)
      if ((error as { code?: string }).code === '23505') {
        return NextResponse.json(
          { error: 'A product with this id already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/products - update an existing product
export async function PATCH(request: NextRequest) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const body = await request.json();
    const { id, ...rest } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    if (rest.category && !VALID_CATEGORIES.includes(rest.category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }

    // Map camelCase API fields to snake_case columns
    const updates: Record<string, unknown> = {};
    const fieldMap: Record<string, string> = {
      title: 'title',
      description: 'description',
      category: 'category',
      price: 'price',
      image: 'image',
      features: 'features',
      targetAudience: 'target_audience',
      estimatedValue: 'estimated_value',
      stock: 'stock',
      isActive: 'is_active',
    };

    for (const [key, column] of Object.entries(fieldMap)) {
      if (rest[key] !== undefined) {
        updates[column] = rest[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products?id=... - delete a product
export async function DELETE(request: NextRequest) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required query parameter: id' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
