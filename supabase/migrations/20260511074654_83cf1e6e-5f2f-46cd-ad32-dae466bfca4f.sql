
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "bk public insert" ON public.bookings;
CREATE POLICY "bk public insert" ON public.bookings FOR INSERT WITH CHECK (
  char_length(customer_name) BETWEEN 1 AND 100
  AND char_length(customer_phone) BETWEEN 4 AND 30
  AND status = 'confirmed'
);
