const USER_MESSAGES: Record<number, string> = {
  400: "البيانات غير صالحة. تحقق من الحقول وحاول مجدداً.",
  401: "يجب تسجيل الدخول أولاً.",
  403: "لا تملك صلاحية لهذا الإجراء.",
  404: "العنصر المطلوب غير موجود.",
  429: "طلبات كثيرة. انتظر قليلاً ثم حاول مجدداً.",
  500: "حدث خطأ. حاول لاحقاً.",
  503: "الخدمة غير متاحة مؤقتاً. تحقق من الإعدادات.",
};

/** User-facing message — never expose raw stack traces. */
export function getUserErrorMessage(
  status: number,
  serverMessage?: string | null
): string {
  if (serverMessage && /[\u0600-\u06FF]/.test(serverMessage)) {
    return serverMessage;
  }

  if (status === 503 && serverMessage) {
    return serverMessage;
  }

  return USER_MESSAGES[status] || USER_MESSAGES[500];
}

export function logApiError(scope: string, error: unknown) {
  if (process.env.NODE_ENV === "production") {
    console.error(`[${scope}]`, error instanceof Error ? error.message : error);
    return;
  }
  console.error(`[${scope}]`, error);
}
