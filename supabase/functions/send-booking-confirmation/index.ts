import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

serve(async (req) => {
  try {
    const { record } = await req.json();
    const { customer_name, customer_phone, booking_date, start_time, end_time } = record;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const bookingData = await fetch(
      `${supabaseUrl}/rest/v1/bookings?id=eq.${record.id}&select=*,businesses(name),services(name),staff(name)`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    ).then(r => r.json());

    const booking = bookingData[0];
    const bizName = booking?.businesses?.name ?? "العيادة";
    const serviceName = booking?.services?.name ?? "كشف";
    const doctorName = booking?.staff?.name ? `د. ${booking.staff.name}` : "أي طبيب متاح";
    const time = start_time?.slice(0, 5);
    const endTime = end_time?.slice(0, 5);

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "بوكلي <onboarding@resend.dev>",
        to: ["yhea231120@gmail.com"],
        subject: `✅ تم تأكيد حجزك في ${bizName}`,
        html: `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/></head><body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px;margin:0;"><div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);"><div style="background:#6c5ce7;padding:32px;text-align:center;"><h1 style="color:#fff;margin:0;font-size:22px;">✅ تم تأكيد حجزك</h1><p style="color:#e0d9ff;margin:8px 0 0;font-size:14px;">${bizName}</p></div><div style="padding:32px;"><p style="font-size:16px;color:#333;margin:0 0 24px;">مرحباً <strong>${customer_name}</strong>،</p><p style="color:#555;margin:0 0 24px;">تم تأكيد موعدك بنجاح. إليك تفاصيل الحجز:</p><div style="background:#f8f7ff;border-radius:12px;padding:20px;margin-bottom:24px;"><table style="width:100%;border-collapse:collapse;"><tr><td style="padding:8px 0;color:#888;font-size:14px;">نوع الكشف</td><td style="padding:8px 0;font-weight:bold;color:#333;font-size:14px;">${serviceName}</td></tr><tr><td style="padding:8px 0;color:#888;font-size:14px;">الطبيب</td><td style="padding:8px 0;font-weight:bold;color:#333;font-size:14px;">${doctorName}</td></tr><tr><td style="padding:8px 0;color:#888;font-size:14px;">التاريخ</td><td style="padding:8px 0;font-weight:bold;color:#333;font-size:14px;">${booking_date}</td></tr><tr><td style="padding:8px 0;color:#888;font-size:14px;">الوقت</td><td style="padding:8px 0;font-weight:bold;color:#333;font-size:14px;">${time} — ${endTime}</td></tr><tr><td style="padding:8px 0;color:#888;font-size:14px;">رقم الهاتف</td><td style="padding:8px 0;font-weight:bold;color:#333;font-size:14px;">${customer_phone}</td></tr></table></div><p style="color:#888;font-size:13px;margin:0;">إذا احتجت إلى تغيير أو إلغاء الموعد، يرجى التواصل معنا مباشرة.</p></div><div style="background:#f8f7ff;padding:16px;text-align:center;"><p style="color:#aaa;font-size:12px;margin:0;">مدعوم بـ <strong style="color:#6c5ce7;">بوكلي</strong></p></div></div></body></html>`,
      }),
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
