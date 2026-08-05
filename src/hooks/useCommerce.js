import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PRICING_DEFAULTS } from '../lib/constants';
import {
  getPendingSales, addPendingSale, removePendingSale,
  getPendingStock, addPendingStock, removePendingStock,
  getTotalPending,
} from '../lib/offlineQueue';

const CONFIG_DEFAULTS = {
  tarifa_hora:     PRICING_DEFAULTS.pago_por_hora,
  margen_propio:   PRICING_DEFAULTS.margen_propio,
  margen_boutique: PRICING_DEFAULTS.margen_boutique,
  redondeo:        0,
};

export function useCommerce(userId) {
  const [products, setProducts] = useState([]);
  const [channels, setChannels] = useState([]);
  const [sales,    setSales]    = useState([]);
  const [config,   setConfig]   = useState(null);
  const [costings, setCostings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  // ── Conectividad ──────────────────────────────────────────
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(getTotalPending);

  // ── Carga inicial ─────────────────────────────────────────
  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    const [rProd, rChan, rSales, rCfg, rCost] = await Promise.all([
      supabase.from('store_products').select('*').eq('user_id', userId).order('nombre'),
      supabase.from('store_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('store_sales').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('price_config').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('store_costings').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);

    const errs = [rProd, rChan, rSales, rCfg, rCost].map(r => r.error).filter(Boolean);
    if (errs.length) setError(errs.map(e => e.message).join('; '));

    setProducts(rProd.data || []);
    setChannels(rChan.data || []);
    setSales(rSales.data  || []);
    setCostings(rCost.data || []);

    if (rCfg.data) {
      setConfig(rCfg.data);
    } else {
      const localDefaults = { ...CONFIG_DEFAULTS, user_id: userId };
      setConfig(localDefaults);
      // Si no existe fila, intenta crearla con defaults (best effort)
      try {
        const { data, error } = await supabase
          .from('price_config').insert(localDefaults).select().single();
        if (!error && data) setConfig(data);
      } catch (e) {
        // tabla no disponible aún → se queda con defaults locales
      }
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  // ── CONFIG ────────────────────────────────────────────────
  const saveConfig = useCallback(async (form) => {
    const payload = {
      user_id:         userId,
      tarifa_hora:     Number(form.tarifa_hora)     || CONFIG_DEFAULTS.tarifa_hora,
      margen_propio:   Number(form.margen_propio)   || CONFIG_DEFAULTS.margen_propio,
      margen_boutique: Number(form.margen_boutique) || CONFIG_DEFAULTS.margen_boutique,
      redondeo:        Number(form.redondeo)        || 0,
      updated_at:      new Date().toISOString(),
    };

    if (config?.id) {
      const { data, error } = await supabase
        .from('price_config').update(payload).eq('id', config.id).select().single();
      if (error) throw new Error(error.message);
      setConfig(data);
      return data;
    } else {
      const { data, error } = await supabase
        .from('price_config').insert(payload).select().single();
      if (error) throw new Error(error.message);
      setConfig(data);
      return data;
    }
  }, [userId, config]);

  // ── PRODUCTOS / CATÁLOGO ──────────────────────────────────
  const saveProduct = useCallback(async (form) => {
    const payload = {
      user_id:          userId,
      nombre:           form.nombre,
      emoji:            form.emoji           || '🧸',
      categoria:        form.categoria       || 'amigurumi',
      descripcion:      form.descripcion     || null,
      precio_venta:     Number(form.precio_venta)     || 0,
      precio_boutique:  Number(form.precio_boutique)  || 0,
      costo_base:       Number(form.costo_base)       || 0,
      tiempo_elaboracion: form.tiempo_elaboracion || null,
      estado_catalogo:  form.estado_catalogo || 'activo',
      stock_inicial:    Number(form.stock_inicial)    || 0,
      stock_vendido:    Number(form.stock_vendido)    || 0,
      patron_id:        form.patron_id       || null,
      patron_nombre:    form.patron_nombre   || null,
      activo:           form.activo !== false,
      color_hex:        form.color_hex       || '#FAD2E1',
      updated_at:       new Date().toISOString(),
    };

    if (form.id) {
      const { data, error } = await supabase
        .from('store_products').update(payload).eq('id', form.id).select().single();
      if (error) throw new Error(error.message);
      setProducts(prev => prev.map(p => p.id === form.id ? data : p));
      return data;
    } else {
      const { data, error } = await supabase
        .from('store_products').insert(payload).select().single();
      if (error) throw new Error(error.message);
      setProducts(prev => [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      return data;
    }
  }, [userId]);

  const deleteProduct = useCallback(async (id) => {
    const { error } = await supabase.from('store_products').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const addStock = useCallback(async (productId, cantidad) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const cant = Number(cantidad) || 0;

    if (!navigator.onLine) {
      const newStock = (product.stock_inicial || 0) + cant;
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, stock_inicial: newStock } : p
      ));
      addPendingStock({ productId, cantidad: cant });
      setPendingCount(getTotalPending());
      return { ...product, stock_inicial: newStock };
    }

    const newStock = (product.stock_inicial || 0) + cant;
    const { data, error } = await supabase
      .from('store_products')
      .update({ stock_inicial: newStock, updated_at: new Date().toISOString() })
      .eq('id', productId).select().single();
    if (error) throw new Error(error.message);
    setProducts(prev => prev.map(p => p.id === productId ? data : p));
    return data;
  }, [products]);

  // ── CANALES ───────────────────────────────────────────────
  const saveChannel = useCallback(async (form) => {
    const payload = {
      user_id:        userId,
      nombre:         form.nombre,
      tipo:           form.tipo           || 'bazar',
      tipo_canal:     form.tipo_canal     || form.tipo || 'bazar',
      es_activo_ahora: form.es_activo_ahora === true,
      fecha_inicio:   form.fecha_inicio   || null,
      fecha_fin:      form.fecha_fin      || null,
      notas:          form.notas          || null,
      activo:         form.activo !== false,
      updated_at:     new Date().toISOString(),
    };

    if (form.id) {
      const { data, error } = await supabase
        .from('store_events').update(payload).eq('id', form.id).select().single();
      if (error) throw new Error(error.message);
      setChannels(prev => prev.map(c => c.id === form.id ? data : c));
      return data;
    } else {
      const { data, error } = await supabase
        .from('store_events').insert(payload).select().single();
      if (error) throw new Error(error.message);
      setChannels(prev => [data, ...prev]);
      return data;
    }
  }, [userId]);

  const deleteChannel = useCallback(async (id) => {
    const { error } = await supabase.from('store_events').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setChannels(prev => prev.filter(c => c.id !== id));
  }, []);

  const setActiveChannel = useCallback(async (id) => {
    // Quitar activo de todos los demás
    const ids = channels.map(c => c.id).filter(cid => cid !== id);
    if (ids.length) {
      await supabase.from('store_events')
        .update({ es_activo_ahora: false, updated_at: new Date().toISOString() })
        .in('id', ids);
    }
    const { data, error } = await supabase
      .from('store_events')
      .update({ es_activo_ahora: true, updated_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) throw new Error(error.message);
    setChannels(prev => prev.map(c =>
      c.id === id ? data : { ...c, es_activo_ahora: false }
    ));
    return data;
  }, [channels]);

  const activeChannel = channels.find(c => c.es_activo_ahora) || null;

  // ── VENTAS ────────────────────────────────────────────────
  const registerSale = useCallback(async ({ product, channel, items = [], fecha, metodoPago }) => {
    const saleRows = items.map(item => {
      const cant  = Number(item.cantidad)   || 1;
      const price = Number(item.precio_unit) || 0;
      return {
        user_id:        userId,
        product_id:     item.product_id,
        event_id:       channel?.id || null,
        product_nombre: item.nombre || product?.nombre || '',
        product_emoji:  item.emoji  || product?.emoji  || '🧸',
        event_nombre:   channel?.nombre || null,
        cantidad:       cant,
        precio_unit:    price,
        total:          cant * price,
        fecha:          fecha || new Date().toISOString().slice(0, 10),
        metodo_pago:    metodoPago || 'efectivo',
        notas:          item.notas || null,
      };
    });
    if (saleRows.length === 0) return [];

    if (!navigator.onLine) {
      const tempSales = saleRows.map((row, i) => ({ ...row, id: 'offline_' + Date.now() + '_' + i }));
      // Actualizar stock localmente por cada item
      const stockMap = {};
      for (const row of saleRows) {
        stockMap[row.product_id] = (stockMap[row.product_id] || 0) + row.cantidad;
      }
      setProducts(prev => prev.map(p =>
        stockMap[p.id] ? { ...p, stock_vendido: (p.stock_vendido || 0) + stockMap[p.id] } : p
      ));
      setSales(prev => [...tempSales, ...prev]);
      for (const row of saleRows) addPendingSale(row);
      setPendingCount(getTotalPending());
      return tempSales;
    }

    // 1. Insertar todas las ventas
    const { data: inserted, error: saleErr } = await supabase
      .from('store_sales').insert(saleRows).select();
    if (saleErr) throw new Error(saleErr.message);

    // 2. Actualizar stock_vendido de cada producto
    const stockMap = {};
    for (const row of saleRows) {
      stockMap[row.product_id] = (stockMap[row.product_id] || 0) + row.cantidad;
    }
    for (const [pid, cant] of Object.entries(stockMap)) {
      const fresh = await supabase
        .from('store_products').select('stock_vendido').eq('id', pid).single();
      const newVendido = (fresh.data?.stock_vendido || 0) + cant;
      await supabase.from('store_products')
        .update({ stock_vendido: newVendido, updated_at: new Date().toISOString() })
        .eq('id', pid);
    }
    await load();
    return inserted;
  }, [userId, load]);

  const deleteSale = useCallback(async (sale) => {
    const { error } = await supabase.from('store_sales').delete().eq('id', sale.id);
    if (error) throw new Error(error.message);

    const product = products.find(p => p.id === sale.product_id);
    if (product) {
      const newVendido = Math.max(0, (product.stock_vendido || 0) - sale.cantidad);
      const { data: prodData } = await supabase
        .from('store_products')
        .update({ stock_vendido: newVendido, updated_at: new Date().toISOString() })
        .eq('id', product.id).select().single();
      if (prodData) setProducts(prev => prev.map(p => p.id === product.id ? prodData : p));
    }
    setSales(prev => prev.filter(s => s.id !== sale.id));
  }, [products]);

  const channelStats = useCallback((channelId) => {
    const ventas = sales.filter(s => s.event_id === channelId);
    const efectivo = ventas.filter(v => v.metodo_pago === 'efectivo')
      .reduce((s, v) => s + (v.total || 0), 0);
    const transferencia = ventas.filter(v => v.metodo_pago === 'transferencia')
      .reduce((s, v) => s + (v.total || 0), 0);
    return {
      piezas:   ventas.reduce((s, v) => s + v.cantidad, 0),
      ingresos: ventas.reduce((s, v) => s + v.total, 0),
      efectivo,
      transferencia,
      ventas,
    };
  }, [sales]);

  // ── COSTINGS ──────────────────────────────────────────────
  const saveCosting = useCallback(async (form, { createProduct = false, updateProduct = null } = {}) => {
    const payload = {
      user_id:         userId,
      patron_id:       form.patron_id       || null,
      patron_nombre:   form.patron_nombre   || null,
      nombre:          form.nombre,
      materiales:      form.materiales      || [],
      horas:           Number(form.horas)   || 0,
      costo_hora:      Number(form.costo_hora) || 40,
      overhead_pct:    Number(form.overhead_pct)    || 10,
      margen_pct:      Number(form.margen_pct)      || 30,
      costo_total:     Number(form.costo_total)     || 0,
      precio_sugerido: Number(form.precio_sugerido) || 0,
      precio_final:    Number(form.precio_final)    || 0,
      precio_boutique: Number(form.precio_boutique) || 0,
      tiempo_entrega:  form.tiempo_entrega  || null,
      precio_manual:   form.precio_manual   || false,
      notas:           form.notas           || null,
      updated_at:      new Date().toISOString(),
    };

    let costing;
    if (form.id) {
      const { data, error } = await supabase
        .from('store_costings').update(payload).eq('id', form.id).select().single();
      if (error) throw new Error(error.message);
      costing = data;
      setCostings(prev => prev.map(c => c.id === form.id ? data : c));
    } else {
      const { data, error } = await supabase
        .from('store_costings').insert(payload).select().single();
      if (error) throw new Error(error.message);
      costing = data;
      setCostings(prev => [data, ...prev]);
    }

    // Manejar producto: crear, actualizar o no tocar
    let product = null;
    if (createProduct) {
      const { data, error } = await supabase.from('store_products').insert({
        user_id:          userId,
        nombre:           form.nombre,
        emoji:            form.emoji           || '🧸',
        categoria:        form.categoria       || 'amigurumi',
        precio_venta:     Number(form.precio_final)    || 0,
        precio_boutique:  Number(form.precio_boutique) || 0,
        costo_base:       Number(form.costo_total)     || 0,
        tiempo_elaboracion: form.tiempo_entrega || null,
        stock_inicial:    Number(form.stock_inicial)   || 0,
        stock_vendido:    0,
        patron_id:        form.patron_id     || null,
        patron_nombre:    form.patron_nombre || null,
        color_hex:        form.color_hex     || '#FAD2E1',
        updated_at:       new Date().toISOString(),
      }).select().single();
      if (error) throw new Error(error.message);
      product = data;
      setProducts(prev => [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    } else if (updateProduct) {
      const { data, error } = await supabase.from('store_products').update({
        precio_venta:     Number(form.precio_final)    || 0,
        precio_boutique:  Number(form.precio_boutique) || 0,
        costo_base:       Number(form.costo_total)     || 0,
        tiempo_elaboracion: form.tiempo_entrega || null,
        updated_at:       new Date().toISOString(),
      }).eq('id', updateProduct).select().single();
      if (error) throw new Error(error.message);
      product = data;
      setProducts(prev => prev.map(p => p.id === updateProduct ? data : p));
    }

    // Vincular product_id al costing si se creó/actualizó producto
    if (product?.id && product.id !== form.product_id) {
      await supabase.from('store_costings')
        .update({ product_id: product.id }).eq('id', costing.id);
      setCostings(prev => prev.map(c => c.id === costing.id ? { ...c, product_id: product.id } : c));
    }

    return { costing, product };
  }, [userId]);

  // ── Sincronización de operaciones pendientes ──────────────
  const _syncPending = useCallback(async () => {
    if (!navigator.onLine || !userId) return;

    const pendingSales = getPendingSales();
    const pendingStock = getPendingStock();
    if (pendingSales.length === 0 && pendingStock.length === 0) return;

    let synced = 0;

    for (const sale of pendingSales) {
      try {
        const { _id, _savedAt, ...saleData } = sale;
        const { error: saleErr } = await supabase
          .from('store_sales').insert(saleData).select().single();
        if (saleErr) throw saleErr;

        const { data: freshProduct } = await supabase
          .from('store_products')
          .select('stock_vendido')
          .eq('id', sale.product_id)
          .single();
        const newVendido = (freshProduct?.stock_vendido || 0) + sale.cantidad;
        const { error: updateErr } = await supabase
          .from('store_products')
          .update({ stock_vendido: newVendido, updated_at: new Date().toISOString() })
          .eq('id', sale.product_id);
        if (updateErr) throw updateErr;

        removePendingSale(_id);
        synced++;
      } catch (e) {
        console.error('Error sincronizando venta:', e);
      }
    }

    for (const entry of pendingStock) {
      try {
        const product = products.find(p => p.id === entry.productId);
        if (!product) { removePendingStock(entry._id); continue; }
        const newStock = (product.stock_inicial || 0) + entry.cantidad;
        const { error } = await supabase.from('store_products')
          .update({ stock_inicial: newStock, updated_at: new Date().toISOString() })
          .eq('id', entry.productId);
        if (error) throw error;
        removePendingStock(entry._id);
        synced++;
      } catch (e) {
        console.error('Error sincronizando stock:', e);
      }
    }

    setPendingCount(getTotalPending());
    if (synced > 0) await load();
    return synced;
  }, [userId, products, load]);

  // ── Conectividad (detección + sync automático) ────────────
  useEffect(() => {
    const handleOnline  = () => { setIsOnline(true); _syncPending(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    if (navigator.onLine) _syncPending();
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [_syncPending]);

  // ── Derived / stats ───────────────────────────────────────
  const statsGlobal = {
    totalProductos:  products.length,
    totalPiezas:     products.reduce((s, p) => s + (p.stock_inicial || 0), 0),
    totalVendidas:   products.reduce((s, p) => s + (p.stock_vendido || 0), 0),
    totalIngresos:   sales.reduce((s, v) => s + (v.total || 0), 0),
  };

  return {
    products, channels, sales, config, costings,
    loading, error,
    saveConfig,
    saveProduct, deleteProduct, addStock, statsGlobal,
    saveChannel, deleteChannel, setActiveChannel, activeChannel,
    registerSale, deleteSale, channelStats,
    saveCosting,
    isOnline, pendingCount,
    reload: load,
    syncPending: _syncPending,
  };
}