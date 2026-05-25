import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function usePatterns(userId) {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const loadPatterns = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('patterns')
      .select('*')
      .eq('user_id', userId)                        // ← solo los del usuario
      .order('created_at', { ascending: false });

    if (err) { setError(err.message); }
    else      { setPatterns(data || []); }
    setLoading(false);
  }, [userId]);

  useEffect(() => { loadPatterns(); }, [loadPatterns]);

  const savePattern = useCallback(async (form) => {
    const payload = {
      user_id:    userId,                           // ← siempre asociado al usuario
      nombre:     form.nombre,
      emoji:      form.emoji,
      dificultad: form.dificultad,
      estado:     form.estado,
      talla:      form.talla     || null,
      aguja:      form.aguja     || null,
      hilos:      form.hilos     || [],
      materiales: form.materiales || null,
      notas:      form.notas     || null,
      pasos:      form.pasos     || [],
      imagen_url: form.imagen_url || null,
      color:      form.color,
      fecha:      form.fecha,
      updated_at: new Date().toISOString(),
    };

    if (form.id) {
      const { data, error: err } = await supabase
        .from('patterns').update(payload).eq('id', form.id).select().single();
      if (err) throw new Error(err.message);
      setPatterns(prev => prev.map(p => p.id === form.id ? data : p));
      return data;
    } else {
      const { data, error: err } = await supabase
        .from('patterns').insert(payload).select().single();
      if (err) throw new Error(err.message);
      setPatterns(prev => [data, ...prev]);
      return data;
    }
  }, [userId]);

  const deletePattern = useCallback(async (id) => {
    const { error: err } = await supabase.from('patterns').delete().eq('id', id);
    if (err) throw new Error(err.message);
    setPatterns(prev => prev.filter(p => p.id !== id));
  }, []);

  const toggleStep = useCallback(async (patternId, stepId) => {
    const pattern = patterns.find(p => p.id === patternId);
    if (!pattern) return;
    const updatedPasos = pattern.pasos.map(s =>
      s.id === stepId ? { ...s, hecho: !s.hecho } : s
    );
    const { data, error: err } = await supabase
      .from('patterns').update({ pasos: updatedPasos, updated_at: new Date().toISOString() })
      .eq('id', patternId).select().single();
    if (err) throw new Error(err.message);
    setPatterns(prev => prev.map(p => p.id === patternId ? data : p));
    return data;
  }, [patterns]);

  // Sube imagen y devuelve la URL pública
  const uploadImage = useCallback(async (file) => {
    // Redimensionar antes de subir (optimización de imágenes)
    const resized   = await resizeImage(file, 1200, 0.82);
    const ext       = 'jpg';
    const fileName  = `${userId}/${Date.now()}.${ext}`;

    const { error: err } = await supabase.storage
      .from('pattern-images')
      .upload(fileName, resized, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: false });

    if (err) throw new Error(err.message);

    const { data: urlData } = supabase.storage
      .from('pattern-images').getPublicUrl(fileName);

    return urlData.publicUrl;
  }, [userId]);

  return { patterns, loading, error, savePattern, deletePattern, toggleStep, uploadImage, reload: loadPatterns };
}

// ── Utilidad: redimensiona y comprime imagen en el browser ──────────────────
function resizeImage(file, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale  = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Canvas toBlob falló')),
        'image/jpeg', quality);
    };
    img.onerror = reject;
    img.src = url;
  });
}
