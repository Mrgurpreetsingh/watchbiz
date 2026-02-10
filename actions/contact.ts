'use server';

import { z } from 'zod';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Schéma de validation
const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Veuillez sélectionner un sujet'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
  consent: z.literal('on', {
    errorMap: () => ({ message: 'Vous devez accepter le traitement de vos données' }),
  }),
});

export async function sendContactMessage(formData: FormData) {
  try {
    // Validation des données
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      subject: formData.get('subject'),
      message: formData.get('message'),
      consent: formData.get('consent'),
    };

    const validatedData = contactSchema.parse(data);

    // Préparer le contenu de l'email
    const subjectMap: Record<string, string> = {
      information: 'Demande d\'information',
      conseil: 'Demande de conseil personnalisé',
      commande: 'Question sur une commande',
      sav: 'Service après-vente',
      autre: 'Autre demande',
    };

    const emailSubject = `[WatchBiz Contact] ${subjectMap[validatedData.subject] || 'Nouveau message'}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 20px; }
            .field-label { font-weight: bold; color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
            .field-value { color: #1e293b; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">Nouveau Message de Contact</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="field-label">Nom</div>
                <div class="field-value">${validatedData.name}</div>
              </div>

              <div class="field">
                <div class="field-label">Email</div>
                <div class="field-value"><a href="mailto:${validatedData.email}">${validatedData.email}</a></div>
              </div>

              ${validatedData.phone ? `
                <div class="field">
                  <div class="field-label">Téléphone</div>
                  <div class="field-value">${validatedData.phone}</div>
                </div>
              ` : ''}

              <div class="field">
                <div class="field-label">Sujet</div>
                <div class="field-value">${subjectMap[validatedData.subject] || validatedData.subject}</div>
              </div>

              <div class="field">
                <div class="field-label">Message</div>
                <div class="field-value" style="white-space: pre-wrap;">${validatedData.message}</div>
              </div>

              <div class="footer">
                <p>Message reçu via le formulaire de contact de WatchBiz</p>
                <p>${new Date().toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
Nouveau message de contact WatchBiz

Nom: ${validatedData.name}
Email: ${validatedData.email}
${validatedData.phone ? `Téléphone: ${validatedData.phone}` : ''}
Sujet: ${subjectMap[validatedData.subject] || validatedData.subject}

Message:
${validatedData.message}

---
Message reçu le ${new Date().toLocaleString('fr-FR')}
    `;

    // Envoyer l'email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'WatchBiz Contact <onboarding@resend.dev>', // Utilisez votre domaine vérifié en production
      to: process.env.CONTACT_EMAIL || 'contact@watchbiz.com',
      replyTo: validatedData.email,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
    });

    if (emailError) {
      console.error('Erreur Resend:', emailError);
      return {
        success: false,
        error: 'Erreur lors de l\'envoi du message. Veuillez réessayer.',
      };
    }

    // Email de confirmation à l'utilisateur (optionnel)
    await resend.emails.send({
      from: 'WatchBiz <onboarding@resend.dev>',
      to: validatedData.email,
      subject: 'Nous avons bien reçu votre message - WatchBiz',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px; }
              .cta { text-align: center; margin: 30px 0; }
              .button { background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%); color: #1e293b; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px;">Message bien reçu !</h1>
              </div>
              <div class="content">
                <p>Bonjour ${validatedData.name},</p>

                <p>Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.</p>

                <p>Notre équipe d'experts va traiter votre demande dans les plus brefs délais. Vous recevrez une réponse sous 24 heures ouvrées maximum.</p>

                <div style="background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
                  <p style="margin: 0; font-weight: bold; color: #64748b; font-size: 12px; text-transform: uppercase;">Votre message :</p>
                  <p style="margin: 10px 0 0 0; color: #1e293b; white-space: pre-wrap;">${validatedData.message}</p>
                </div>

                <div class="cta">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" class="button">
                    Découvrir nos montres
                  </a>
                </div>

                <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
                  À très bientôt,<br>
                  <strong>L'équipe WatchBiz</strong>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return {
      success: true,
      messageId: emailData?.id,
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    return {
      success: false,
      error: 'Une erreur est survenue. Veuillez réessayer.',
    };
  }
}
