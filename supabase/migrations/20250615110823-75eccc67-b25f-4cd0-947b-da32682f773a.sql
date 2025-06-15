
-- Add product_code column to the products table
ALTER TABLE public.products 
ADD COLUMN product_code TEXT;

-- Update existing products with default codes using a simpler approach
DO $$
DECLARE
    product_record RECORD;
    counter INTEGER := 1;
BEGIN
    FOR product_record IN 
        SELECT id FROM public.products ORDER BY created_at
    LOOP
        UPDATE public.products 
        SET product_code = 'PROD' || LPAD(counter::TEXT, 3, '0')
        WHERE id = product_record.id;
        counter := counter + 1;
    END LOOP;
END $$;

-- Make product_code required and unique for new records
ALTER TABLE public.products 
ALTER COLUMN product_code SET NOT NULL;

ALTER TABLE public.products 
ADD CONSTRAINT products_product_code_unique UNIQUE (product_code);
