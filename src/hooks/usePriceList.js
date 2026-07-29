import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { PRICING_DEFAULTS } from '../lib/constants';

export function calcPrecioBoutique({ costo_material, horas, costo_empaque, pago_por_hora, margen_propio, margen_boutique }) {
  const pagoHora   = Number(pago_por_hora)   || PRICING_DEFAULTS.pago_por_hora;
  const mPropio    = Number(margen_propio)    || PRICING_DEFAULTS.margen_propio;
  const mBoutique  = Number(margen_boutique)  || PRICING_DEFAULTS.margen_boutique;

  const costoTotal     = (Number(costo_material) || 0) + ((Number(horas) || 0) * pagoHora) + (Number(costo_empaque) || 0);
  const precioBoutique = costoTotal * (1 + mPropio);
  const precioPublico  = mBoutique < 1 ? precioBoutique / (1 - mBoutique) : precioBoutique;
  const utilidadTuya   = precioBoutique - costoTotal;

  return {
    costo_total:     Math.round(costoTotal * 100) / 100,
    precio_boutique: Math.round(precioBoutique * 100) / 100,
    precio_publico:  Math.round(precioPublico * 100) / 100,
    utilidad_tuya:   Math.round(utilidadTuya * 100) / 100,
  };
}

export function usePriceConfig(userId) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('price_config').select('*').eq('user_id', userId).maybeSingle();
    if (data) {
      setConfig(data);
    } else {
      setConfig({ pago_por_hora: PRICING_DEFAULTS.pago_por_hora, margen_boutique: PRICING_DEFAULTS.margen_boutique, margen_propio: PRICING_DEFAULTS.margen_propio });
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const saveConfig = useCallback(async (form) => {
    const payload = {
      user_id: userId,
      pago_por_hora:   Number(form.pago_por_hora)   || PRICING_DEFAULTS.pago_por_hora,
      margen_boutique: Number(form.margen_boutique) || PRICING_DEFAULTS.margen_boutique,
      margen_propio:   Number(form.margen_propio)   || PRICING_DEFAULTS.margen_propio,
      updated_at: new Date().toISOString(),
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

  return { config, loading, saveConfig, reload: load };
}

export function usePriceList(userId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('price_list').select('*').eq('user_id', userId).order('orden').order('nombre');
    if (err) setError(err.message);
    setItems(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const saveItem = useCallback(async (form) => {
    const payload = {
      user_id:        userId,
      nombre:         form.nombre,
      emoji:          form.emoji         || '🧸',
      size:           form.size          || null,
      costo_material: Number(form.costo_material) || 0,
      horas:          Number(form.horas)          || 0,
      costo_empaque:  Number(form.costo_empaque)  || 0,
      nota:           form.nota          || null,
      patron_id:      form.patron_id     || null,
      orden:          Number(form.orden)  || 0,
      activo:         form.activo !== false,
      updated_at:     new Date().toISOString(),
    };

    if (form.id) {
      const { data, error: err } = await supabase
        .from('price_list').update(payload).eq('id', form.id).select().single();
      if (err) throw new Error(err.message);
      setItems(prev => prev.map(i => i.id === form.id ? data : i));
      return data;
    } else {
      const { data, error: err } = await supabase
        .from('price_list').insert(payload).select().single();
      if (err) throw new Error(err.message);
      setItems(prev => [...prev, data].sort((a, b) => (a.orden || 0) - (b.orden || 0) || a.nombre.localeCompare(b.nombre)));
      return data;
    }
  }, [userId]);

  const deleteItem = useCallback(async (id) => {
    const { error: err } = await supabase.from('price_list').delete().eq('id', id);
    if (err) throw new Error(err.message);
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  return { items, loading, error, saveItem, deleteItem, reload: load };
}
