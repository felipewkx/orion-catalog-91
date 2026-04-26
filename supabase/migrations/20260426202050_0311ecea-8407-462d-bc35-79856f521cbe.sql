CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  comment TEXT NOT NULL,
  rating SMALLINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Validation trigger (rating between 0 and 5, basic length checks)
CREATE OR REPLACE FUNCTION public.validate_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.rating < 0 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'A nota deve estar entre 0 e 5';
  END IF;
  IF char_length(trim(NEW.full_name)) < 2 OR char_length(NEW.full_name) > 120 THEN
    RAISE EXCEPTION 'Nome completo inválido';
  END IF;
  IF char_length(NEW.email) > 255 OR NEW.email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'E-mail inválido';
  END IF;
  IF char_length(trim(NEW.comment)) < 1 OR char_length(NEW.comment) > 1000 THEN
    RAISE EXCEPTION 'Comentário inválido';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER reviews_validate_before_insert
  BEFORE INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.validate_review();

-- RLS Policies
CREATE POLICY "Anyone can view reviews"
  ON public.reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can delete reviews"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_reviews_created_at ON public.reviews (created_at DESC);