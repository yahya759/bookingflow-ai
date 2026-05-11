
-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles self read" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- businesses
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Business',
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  welcome_message TEXT DEFAULT 'Welcome! Let''s book your appointment.',
  confirmation_message TEXT DEFAULT 'Your booking is confirmed. See you soon!',
  allow_staff_selection BOOLEAN NOT NULL DEFAULT true,
  instant_confirmation BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "biz owner all" ON public.businesses FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "biz public read" ON public.businesses FOR SELECT USING (true);

-- services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "svc owner all" ON public.services FOR ALL
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()));
CREATE POLICY "svc public read" ON public.services FOR SELECT USING (true);

-- staff
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff owner all" ON public.staff FOR ALL
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()));
CREATE POLICY "staff public read" ON public.staff FOR SELECT USING (true);

-- staff_services
CREATE TABLE public.staff_services (
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ss owner all" ON public.staff_services FOR ALL
  USING (EXISTS (SELECT 1 FROM public.staff s JOIN public.businesses b ON b.id = s.business_id WHERE s.id = staff_id AND b.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.staff s JOIN public.businesses b ON b.id = s.business_id WHERE s.id = staff_id AND b.owner_id = auth.uid()));
CREATE POLICY "ss public read" ON public.staff_services FOR SELECT USING (true);

-- working_hours
CREATE TABLE public.working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL,
  open_time TIME NOT NULL DEFAULT '09:00',
  close_time TIME NOT NULL DEFAULT '18:00',
  break_start TIME,
  break_end TIME,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(business_id, day_of_week)
);
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wh owner all" ON public.working_hours FOR ALL
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()));
CREATE POLICY "wh public read" ON public.working_hours FOR SELECT USING (true);

-- flow_steps
CREATE TABLE public.flow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  position INTEGER NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  custom_label TEXT,
  UNIQUE(business_id, step_key)
);
ALTER TABLE public.flow_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fs owner all" ON public.flow_steps FOR ALL
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()));
CREATE POLICY "fs public read" ON public.flow_steps FOR SELECT USING (true);

-- bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bk owner all" ON public.bookings FOR ALL
  USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.owner_id = auth.uid()));
CREATE POLICY "bk public read" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "bk public insert" ON public.bookings FOR INSERT WITH CHECK (true);

-- Trigger: on signup create profile + default business + default working hours + flow steps
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_biz_id UUID;
  new_slug TEXT;
  d INT;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)));

  new_slug := lower(regexp_replace(COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), '[^a-zA-Z0-9]+','-','g')) || '-' || substr(NEW.id::text,1,6);

  INSERT INTO public.businesses (owner_id, name, slug)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'My Business'), new_slug)
  RETURNING id INTO new_biz_id;

  FOR d IN 0..6 LOOP
    INSERT INTO public.working_hours (business_id, day_of_week, is_closed)
    VALUES (new_biz_id, d, CASE WHEN d=0 THEN true ELSE false END);
  END LOOP;

  INSERT INTO public.flow_steps (business_id, step_key, position, enabled, custom_label) VALUES
    (new_biz_id, 'welcome', 1, true, 'Welcome'),
    (new_biz_id, 'service', 2, true, 'Choose Service'),
    (new_biz_id, 'staff',   3, true, 'Choose Staff'),
    (new_biz_id, 'date',    4, true, 'Choose Date'),
    (new_biz_id, 'time',    5, true, 'Choose Time'),
    (new_biz_id, 'confirm', 6, true, 'Confirmation');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
