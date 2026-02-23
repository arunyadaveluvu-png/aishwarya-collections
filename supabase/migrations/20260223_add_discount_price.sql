-- Add discount_price column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS discount_price numeric DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.products.discount_price IS 'Sale price of the product';
