-- Add sizes column to products table
-- Using text[] to store multiple sizes (S, M, L, XL, XXL)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sizes text[] DEFAULT '{}';

-- Add comment for clarity
COMMENT ON COLUMN public.products.sizes IS 'List of available sizes for the product (e.g. S, M, L, XL, XXL)';
