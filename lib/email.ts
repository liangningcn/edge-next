// 邮件服务 - 多语言邮件模板

interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

// 支持的语言列表
const SUPPORTED_LOCALES = [
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
] as const;

// 邮件模板配置
export const EMAIL_TEMPLATES = {
  // 欢迎邮件
  WELCOME: {
    en: 'welcome-en',
    de: 'welcome-de',
    ja: 'welcome-ja',
    fr: 'welcome-fr',
    th: 'welcome-th',
    es: 'welcome-es',
    ru: 'welcome-ru',
    pt: 'welcome-pt',
    it: 'welcome-it',
    nl: 'welcome-nl',
    pl: 'welcome-pl',
    ko: 'welcome-ko',
    id: 'welcome-id',
  },

  // 订单确认
  ORDER_CONFIRMATION: {
    en: 'order-confirmation-en',
    de: 'order-confirmation-de',
    ja: 'order-confirmation-ja',
    fr: 'order-confirmation-fr',
    th: 'order-confirmation-th',
    es: 'order-confirmation-es',
    ru: 'order-confirmation-ru',
    pt: 'order-confirmation-pt',
    it: 'order-confirmation-it',
    nl: 'order-confirmation-nl',
    pl: 'order-confirmation-pl',
    ko: 'order-confirmation-ko',
    id: 'order-confirmation-id',
  },

  // 发货通知
  SHIPPING_NOTIFICATION: {
    en: 'shipping-notification-en',
    de: 'shipping-notification-de',
    ja: 'shipping-notification-ja',
    fr: 'shipping-notification-fr',
    th: 'shipping-notification-th',
    es: 'shipping-notification-es',
    ru: 'shipping-notification-ru',
    pt: 'shipping-notification-pt',
    it: 'shipping-notification-it',
    nl: 'shipping-notification-nl',
    pl: 'shipping-notification-pl',
    ko: 'shipping-notification-ko',
    id: 'shipping-notification-id',
  },

  // 密码重置
  PASSWORD_RESET: {
    en: 'password-reset-en',
    de: 'password-reset-de',
    ja: 'password-reset-ja',
    fr: 'password-reset-fr',
    th: 'password-reset-th',
    es: 'password-reset-es',
    ru: 'password-reset-ru',
    pt: 'password-reset-pt',
    it: 'password-reset-it',
    nl: 'password-reset-nl',
    pl: 'password-reset-pl',
    ko: 'password-reset-ko',
    id: 'password-reset-id',
  },

  // 咨询回复
  INQUIRY_RESPONSE: {
    en: 'inquiry-response-en',
    de: 'inquiry-response-de',
    ja: 'inquiry-response-ja',
    fr: 'inquiry-response-fr',
    th: 'inquiry-response-th',
    es: 'inquiry-response-es',
    ru: 'inquiry-response-ru',
    pt: 'inquiry-response-pt',
    it: 'inquiry-response-it',
    nl: 'inquiry-response-nl',
    pl: 'inquiry-response-pl',
    ko: 'inquiry-response-ko',
    id: 'inquiry-response-id',
  },
};

export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  /**
   * 验证语言支持
   */
  private validateLocale(locale: string): string {
    return SUPPORTED_LOCALES.includes(locale as string) ? locale : 'en';
  }

  /**
   * 获取邮件模板ID
   */
  private getTemplateId(templateType: keyof typeof EMAIL_TEMPLATES, locale: string): string {
    const validLocale = this.validateLocale(locale);
    const template = EMAIL_TEMPLATES[templateType];
    return template[validLocale as keyof typeof template] || template.en;
  }

  /**
   * 发送多语言邮件
   */
  async sendLocalizedEmail(params: {
    to: string | string[];
    templateType: keyof typeof EMAIL_TEMPLATES;
    locale: string;
    variables: Record<string, unknown>;
    subject?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const validLocale = this.validateLocale(params.locale);
      const templateId = this.getTemplateId(params.templateType, validLocale);

      // 使用Resend发送邮件
      const response = await this.sendWithResend({
        to: params.to,
        templateId,
        subject: params.subject,
        variables: {
          ...params.variables,
          locale: validLocale,
        },
      });

      return { success: true, messageId: response.id };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * 发送欢迎邮件
   */
  async sendWelcomeEmail(params: {
    to: string;
    name: string;
    locale: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendLocalizedEmail({
      to: params.to,
      templateType: 'WELCOME',
      locale: params.locale,
      variables: {
        name: params.name,
        welcome_message: this.getLocalizedMessage('welcome_message', params.locale),
        get_started_link: `${process.env.NEXT_PUBLIC_SITE_URL}/products`,
      },
      subject: this.getLocalizedMessage('welcome_subject', params.locale),
    });
  }

  /**
   * 发送订单确认邮件
   */
  async sendOrderConfirmation(params: {
    to: string;
    orderId: string;
    orderTotal: string;
    customerName: string;
    locale: string;
    items: Array<{
      name: string;
      quantity: number;
      price: string;
    }>;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendLocalizedEmail({
      to: params.to,
      templateType: 'ORDER_CONFIRMATION',
      locale: params.locale,
      variables: {
        customer_name: params.customerName,
        order_id: params.orderId,
        order_total: params.orderTotal,
        order_date: new Date().toLocaleDateString(params.locale),
        items: params.items,
        order_details_link: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${params.orderId}`,
        contact_support_link: `${process.env.NEXT_PUBLIC_SITE_URL}/contact`,
      },
      subject: this.getLocalizedMessage('order_confirmation_subject', params.locale, {
        orderId: params.orderId,
      }),
    });
  }

  /**
   * 发送发货通知邮件
   */
  async sendShippingNotification(params: {
    to: string;
    orderId: string;
    trackingNumber: string;
    customerName: string;
    locale: string;
    estimatedDelivery?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendLocalizedEmail({
      to: params.to,
      templateType: 'SHIPPING_NOTIFICATION',
      locale: params.locale,
      variables: {
        customer_name: params.customerName,
        order_id: params.orderId,
        tracking_number: params.trackingNumber,
        shipping_date: new Date().toLocaleDateString(params.locale),
        estimated_delivery:
          params.estimatedDelivery ||
          this.getLocalizedMessage('estimated_delivery_default', params.locale),
        track_order_link: `${process.env.NEXT_PUBLIC_SITE_URL}/tracking/${params.trackingNumber}`,
      },
      subject: this.getLocalizedMessage('shipping_notification_subject', params.locale, {
        orderId: params.orderId,
      }),
    });
  }

  /**
   * 发送密码重置邮件
   */
  async sendPasswordReset(params: {
    to: string;
    resetToken: string;
    name: string;
    locale: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${params.resetToken}`;

    return this.sendLocalizedEmail({
      to: params.to,
      templateType: 'PASSWORD_RESET',
      locale: params.locale,
      variables: {
        name: params.name,
        reset_link: resetLink,
        expiry_time: '24 hours',
      },
      subject: this.getLocalizedMessage('password_reset_subject', params.locale),
    });
  }

  /**
   * 发送咨询回复邮件
   */
  async sendInquiryResponse(params: {
    to: string;
    inquiryId: string;
    customerName: string;
    response: string;
    locale: string;
    agentName?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return this.sendLocalizedEmail({
      to: params.to,
      templateType: 'INQUIRY_RESPONSE',
      locale: params.locale,
      variables: {
        customer_name: params.customerName,
        inquiry_id: params.inquiryId,
        response: params.response,
        agent_name: params.agentName || this.getLocalizedMessage('support_team', params.locale),
        response_date: new Date().toLocaleDateString(params.locale),
        contact_further_link: `${process.env.NEXT_PUBLIC_SITE_URL}/contact`,
      },
      subject: this.getLocalizedMessage('inquiry_response_subject', params.locale, {
        inquiryId: params.inquiryId,
      }),
    });
  }

  /**
   * 使用Resend发送邮件
   */
  private async sendWithResend(params: {
    to: string | string[];
    templateId: string;
    subject: string;
    variables: Record<string, any>;
  }): Promise<{ id: string }> {
    // 在实际部署中，这里会调用Resend API
    // 使用环境变量中的API密钥

    // 模拟Resend API调用
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ id: `mock-${Date.now()}` });
      }, 100);
    });
  }

  /**
   * 获取本地化消息
   */
  private getLocalizedMessage(
    key: string,
    locale: string,
    variables?: Record<string, any>
  ): string {
    const messages = this.getMessages(locale);
    let message = messages[key] || messages[key.replace(/_/g, '-')] || key;

    // 替换变量
    if (variables) {
      Object.keys(variables).forEach(variable => {
        message = message.replace(`{${variable}}`, variables[variable]);
      });
    }

    return message;
  }

  /**
   * 获取邮件模板消息
   */
  private getMessages(locale: string): Record<string, string> {
    const baseMessages = {
      welcome_subject: 'Welcome to TOP-Q Filler',
      welcome_message: 'Thank you for joining TOP-Q Filler!',
      order_confirmation_subject: 'Order Confirmation - {orderId}',
      shipping_notification_subject: 'Your Order #{orderId} Has Shipped',
      password_reset_subject: 'Password Reset Request',
      inquiry_response_subject: 'Response to Your Inquiry #{inquiryId}',
      estimated_delivery_default: '5-7 business days',
      support_team: 'Support Team',
    };

    // 这里可以添加其他语言的翻译
    const localizedMessages: Record<string, Record<string, string>> = {
      de: {
        welcome_subject: 'Willkommen bei TOP-Q Filler',
        welcome_message: 'Vielen Dank für Ihre Anmeldung bei TOP-Q Filler!',
        order_confirmation_subject: 'Bestellbestätigung - {orderId}',
        shipping_notification_subject: 'Ihre Bestellung #{orderId} wurde versandt',
        password_reset_subject: 'Anfrage zum Zurücksetzen des Passworts',
        inquiry_response_subject: 'Antwort auf Ihre Anfrage #{inquiryId}',
        estimated_delivery_default: '5-7 Werktage',
        support_team: 'Support-Team',
      },
      ja: {
        welcome_subject: 'TOP-Q Fillerへようこそ',
        welcome_message: 'TOP-Q Fillerにご登録いただきありがとうございます！',
        order_confirmation_subject: '注文確認 - {orderId}',
        shipping_notification_subject: '注文 #{orderId} が発送されました',
        password_reset_subject: 'パスワードリセットのリクエスト',
        inquiry_response_subject: 'お問い合わせ #{inquiryId} への回答',
        estimated_delivery_default: '5-7営業日',
        support_team: 'サポートチーム',
      },
      // 可以继续添加其他语言的翻译
    };

    return { ...baseMessages, ...(localizedMessages[locale] || {}) };
  }
}

// 创建默认邮件服务实例
export const emailService = new EmailService({
  apiKey: process.env.RESEND_API_KEY || process.env.MAILJET_API_KEY || '',
  fromEmail: process.env.FROM_EMAIL || 'noreply@topqfiller.com',
  fromName: process.env.FROM_NAME || 'TOP-Q Filler',
});

// 导出类型
export type { EmailConfig };
