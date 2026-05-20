import { supabase } from './supabase';

// ─────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────

export async function getProducts(filters = {}) {
  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.level && filters.level !== 'all') {
    query = query.eq('level', filters.level);
  }
  if (filters.type && filters.type !== 'all') {
    query = query.eq('type', filters.type);
  }
  if (filters.search) {
    query = query.or(
      `title_fr.ilike.%${filters.search}%,title_ar.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ─────────────────────────────────────────
// PDF UPLOAD (Supabase Storage)
// ─────────────────────────────────────────

export async function uploadPDF(file, productId) {
  const ext = file.name.split('.').pop();
  const path = `products/${productId}/file.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('pdfs')
    .upload(path, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('pdfs')
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function getPDFUrl(productId) {
  const { data } = supabase.storage
    .from('pdfs')
    .getPublicUrl(`products/${productId}/file.pdf`);
  return data.publicUrl;
}

// ─────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────

export async function getOrders(filters = {}) {
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (id, title_fr, title_ar, price)
      )
    `)
    .order('created_at', { ascending: false });

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createOrder({ clientName, clientEmail, items, paymentMethod, total }) {
  // 1. Create client if not exists
  let clientId = null;
  const { data: existingClient } = await supabase
    .from('clients')
    .select('id')
    .eq('email', clientEmail)
    .single();

  if (existingClient) {
    clientId = existingClient.id;
  } else {
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert([{ name: clientName, email: clientEmail }])
      .select()
      .single();
    if (clientError) throw clientError;
    clientId = newClient.id;
  }

  // 2. Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      client_id: clientId,
      client_name: clientName,
      client_email: clientEmail,
      payment_method: paymentMethod,
      total,
      status: 'pending',
    }])
    .select()
    .single();

  if (orderError) throw orderError;

  // 3. Create order items
  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.id,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order;
}

export async function updateOrderStatus(orderId, status) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────
// CLIENTS
// ─────────────────────────────────────────

export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      orders (id, total, status, payment_method, created_at)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────
// STATS (dashboard)
// ─────────────────────────────────────────

export async function getDashboardStats() {
  const [productsRes, ordersRes, clientsRes] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact' }),
    supabase.from('orders').select('id, total, status, created_at'),
    supabase.from('clients').select('id', { count: 'exact' }),
  ]);

  const orders = ordersRes.data || [];
  const paidOrders = orders.filter(o => o.status === 'paid');
  const revenue = paidOrders.reduce((s, o) => s + (o.total || 0), 0);

  return {
    totalProducts: productsRes.count || 0,
    totalOrders: orders.length,
    paidOrders: paidOrders.length,
    totalRevenue: revenue,
    totalClients: clientsRes.count || 0,
  };
}
