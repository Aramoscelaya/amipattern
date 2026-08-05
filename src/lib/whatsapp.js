export function buildWhatsAppLink(telefono, mensaje) {
  const numero = telefono.replace(/\D/g, '')
  const texto  = encodeURIComponent(mensaje.trim())
  return `https://wa.me/52${numero}?text=${texto}`
}

export function mensajeEstado(clienteNombre, estado) {
  const mensajes = {
    pendiente:  `Ya tenemos tu pedido registrado y pronto empezamos a trabajar en el!`,
    en_proceso: `Estamos tejiendo tu pieza con mucho carino!`,
    listo:      `Tu pedido esta terminado y listo para entregarse!`,
    completado: `Tu pedido esta terminado y listo para entregarse!`,
    entregado:  `Gracias por tu compra! Espero que lo disfrutes mucho.`,
    cancelado:  `Tu pedido ha sido cancelado. Si tienes dudas, con gusto te atiendo.`,
  }
  return (
    `Hola *${clienteNombre}*!\n` +
    `Solo queria avisarte que tu pedido esta en estado: *${estado}*\n\n` +
    (mensajes[estado] || '')
  )
}

export function mensajeCotizacion({ nombre, emoji, precio, tiempoEntrega, mensajeExtra }) {
  return (
    `Hola! Con gusto te comparto la cotizacion de tu tejido:\n\n` +
    `${nombre}\n` +
    `Precio: $${precio} MXN por pieza\n` +
    `Tiempo de entrega: ${tiempoEntrega} desde la confirmacion\n\n` +
    `Pieza personalizada elaborada completamente a mano. ` +
    `Cuidando cada detalle para asegurar un acabado bonito y de calidad.\n\n` +
    (mensajeExtra ? `${mensajeExtra}\n\n` : '') +
    `Te gustaria apartar tu lugar?`
  )
}