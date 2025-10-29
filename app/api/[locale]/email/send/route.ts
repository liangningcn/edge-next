import { NextRequest, NextResponse } from 'next/server';
import { emailService, EMAIL_TEMPLATES } from '@/lib/email';

export const runtime = 'edge';

// POST /api/[locale]/email/send - 发送邮件
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const { locale } = await params;

    // 验证语言支持
    const supportedLocales = [
      'en',
      'de',
      'ja',
      'fr',
      'th',
      'es',
      'ru',
      'pt',
      'it',
      'nl',
      'pl',
      'ko',
      'id',
    ];
    const validLocale = supportedLocales.includes(locale) ? locale : 'en';

    // 获取请求数据
    const body = await request.json();
    const { to, templateType, variables, subject } = body;

    // 验证必填字段
    if (!to || !templateType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to and templateType' },
        { status: 400 }
      );
    }

    // 验证模板类型
    const validTemplateTypes = Object.keys(EMAIL_TEMPLATES);
    if (!validTemplateTypes.includes(templateType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid template type. Must be one of: ${validTemplateTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 发送邮件
    const result = await emailService.sendLocalizedEmail({
      to,
      templateType: templateType as keyof typeof EMAIL_TEMPLATES,
      locale: validLocale,
      variables: variables || {},
      subject,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          messageId: result.messageId,
          locale: validLocale,
          templateType,
        },
      });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}

// GET /api/[locale]/email/templates - 获取可用的邮件模板
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const { locale } = await params;

    // 验证语言支持
    const supportedLocales = [
      'en',
      'de',
      'ja',
      'fr',
      'th',
      'es',
      'ru',
      'pt',
      'it',
      'nl',
      'pl',
      'ko',
      'id',
    ];
    const validLocale = supportedLocales.includes(locale) ? locale : 'en';

    // 获取模板列表
    const templates = Object.entries(EMAIL_TEMPLATES).map(([type, locales]) => ({
      type,
      name: getTemplateDisplayName(type, validLocale),
      description: getTemplateDescription(type, validLocale),
      availableLocales: Object.keys(locales),
      currentLocale: validLocale,
      templateId: locales[validLocale as keyof typeof locales] || locales.en,
    }));

    return NextResponse.json({
      success: true,
      data: {
        templates,
        supportedLocales,
        currentLocale: validLocale,
      },
    });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email templates' },
      { status: 500 }
    );
  }
}

// 辅助方法 - 获取模板显示名称
function getTemplateDisplayName(templateType: string, locale: string): string {
  const names: Record<string, Record<string, string>> = {
    WELCOME: {
      en: 'Welcome Email',
      de: 'Willkommens-E-Mail',
      ja: 'ウェルカムメール',
      fr: 'Email de bienvenue',
      th: 'อีเมลต้อนรับ',
      es: 'Correo de bienvenida',
      ru: 'Приветственное письмо',
      pt: 'Email de boas-vindas',
      it: 'Email di benvenuto',
      nl: 'Welkomstmail',
      pl: 'Email powitalny',
      ko: '환영 이메일',
      id: 'Email Selamat Datang',
    },
    ORDER_CONFIRMATION: {
      en: 'Order Confirmation',
      de: 'Bestellbestätigung',
      ja: '注文確認',
      fr: 'Confirmation de commande',
      th: 'การยืนยันคำสั่งซื้อ',
      es: 'Confirmación de pedido',
      ru: 'Подтверждение заказа',
      pt: 'Confirmação de pedido',
      it: 'Conferma ordine',
      nl: 'Orderbevestiging',
      pl: 'Potwierdzenie zamówienia',
      ko: '주문 확인',
      id: 'Konfirmasi Pesanan',
    },
    SHIPPING_NOTIFICATION: {
      en: 'Shipping Notification',
      de: 'Versandbenachrichtigung',
      ja: '発送通知',
      fr: "Notification d'expédition",
      th: 'การแจ้งเตือนการจัดส่ง',
      es: 'Notificación de envío',
      ru: 'Уведомление об отправке',
      pt: 'Notificação de envio',
      it: 'Notifica di spedizione',
      nl: 'Verzendmelding',
      pl: 'Powiadomienie o wysyłce',
      ko: '배송 알림',
      id: 'Pemberitahuan Pengiriman',
    },
    PASSWORD_RESET: {
      en: 'Password Reset',
      de: 'Passwort zurücksetzen',
      ja: 'パスワードリセット',
      fr: 'Réinitialisation du mot de passe',
      th: 'รีเซ็ตรหัสผ่าน',
      es: 'Restablecimiento de contraseña',
      ru: 'Сброс пароля',
      pt: 'Redefinição de senha',
      it: 'Reimpostazione password',
      nl: 'Wachtwoord opnieuw instellen',
      pl: 'Reset hasła',
      ko: '비밀번호 재설정',
      id: 'Reset Kata Sandi',
    },
    INQUIRY_RESPONSE: {
      en: 'Inquiry Response',
      de: 'Anfrageantwort',
      ja: 'お問い合わせへの回答',
      fr: 'Réponse à la demande',
      th: 'การตอบกลับคำถาม',
      es: 'Respuesta a la consulta',
      ru: 'Ответ на запрос',
      pt: 'Resposta à consulta',
      it: 'Risposta alla richiesta',
      nl: 'Reactie op aanvraag',
      pl: 'Odpowiedź na zapytanie',
      ko: '문의 응답',
      id: 'Tanggapan Pertanyaan',
    },
  };

  return names[templateType]?.[locale] || names[templateType]?.en || templateType;
}

// 辅助方法 - 获取模板描述
function getTemplateDescription(templateType: string, locale: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    WELCOME: {
      en: 'Welcome email sent to new users after registration',
      de: 'Willkommens-E-Mail, die an neue Benutzer nach der Registrierung gesendet wird',
      ja: '新規ユーザー登録後に送信されるウェルカムメール',
      fr: "Email de bienvenue envoyé aux nouveaux utilisateurs après l'inscription",
      th: 'อีเมลต้อนรับที่ส่งให้ผู้ใช้ใหม่หลังการลงทะเบียน',
      es: 'Correo de bienvenida enviado a nuevos usuarios después del registro',
      ru: 'Приветственное письмо, отправляемое новым пользователям после регистрации',
      pt: 'Email de boas-vindas enviado a novos usuários após o registro',
      it: 'Email di benvenuto inviato ai nuovi utenti dopo la registrazione',
      nl: 'Welkomstmail verzonden naar nieuwe gebruikers na registratie',
      pl: 'Email powitalny wysłany do nowych użytkowników po rejestracji',
      ko: '등록 후 신규 사용자에게 발송되는 환영 이메일',
      id: 'Email selamat datang yang dikirim ke pengguna baru setelah pendaftaran',
    },
    // 可以继续添加其他模板的描述
  };

  return descriptions[templateType]?.[locale] || descriptions[templateType]?.en || '';
}
