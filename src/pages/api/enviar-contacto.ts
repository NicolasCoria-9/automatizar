import { Resend } from 'resend';
import type { APIRoute } from 'astro';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const nombre = formData.get('nombre')?.toString() || '';
    const apellido = formData.get('apellido')?.toString() || '';
    const email = formData.get('email')?.toString() || '';
    const telefono = formData.get('telefono')?.toString() || '';
    const comentario = formData.get('comentario')?.toString() || '';

    if (!nombre || !email || !comentario) {
      return new Response(JSON.stringify({ 
        error: 'Por favor, complete todos los campos requeridos.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Intentando enviar email con los siguientes datos:', {
      from: `${nombre} ${apellido} <${email}>`,
      to: import.meta.env.EMAIL_TO,
      subject: import.meta.env.EMAIL_SUBJECT
    });

    const { data, error } = await resend.emails.send({
      from: `Automatizar Web <onboarding@resend.dev>`,
      replyTo: email,
      to: [import.meta.env.EMAIL_TO],
      subject: import.meta.env.EMAIL_SUBJECT,
      html: `
        <h2>Nueva consulta desde el sitio web</h2>
        <p><strong>Nombre:</strong> ${nombre} ${apellido}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${telefono}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${comentario}</p>
      `
    });

    if (error) {
      console.error('Error al enviar email:', error);
      return new Response(JSON.stringify({ 
        error: 'Error al enviar el mensaje. Por favor, intente nuevamente.',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      message: 'Mensaje enviado correctamente. Nos pondremos en contacto pronto.',
      data
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error en el servidor:', error);
    return new Response(JSON.stringify({ 
      error: 'Error en el servidor. Por favor, intente más tarde.',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
