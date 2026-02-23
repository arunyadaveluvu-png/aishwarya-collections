-- Migration: Advanced Inventory Management (Fixed Version)
-- This version avoids subqueries in the ALTER TABLE ... USING clause

-- 1. Create a temporary column to hold the new data format
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sizes_jsonb jsonb DEFAULT '{}'::jsonb;

-- 2. Migrate data from text[] to jsonb
-- We give each existing size a default quantity of 10
UPDATE public.products 
SET sizes_jsonb = (
  SELECT COALESCE(jsonb_object_agg(size, 10), '{}'::jsonb)
  FROM unnest(sizes) AS size
)
WHERE sizes IS NOT NULL AND array_length(sizes, 1) > 0;

-- 3. Remove the old column and rename the new one
ALTER TABLE public.products DROP COLUMN IF EXISTS sizes;
ALTER TABLE public.products RENAME COLUMN sizes_jsonb TO sizes;

-- 4. Create function to reduce stock on order
-- This function is called by a trigger whenever a new row is added to order_items
CREATE OR REPLACE FUNCTION public.handle_stock_reduction()
RETURNS TRIGGER AS $$
DECLARE
    current_sizes jsonb;
BEGIN
    -- Only run if a row is inserted
    IF (TG_OP = 'INSERT') THEN
        -- Get current sizes map for the product
        SELECT sizes INTO current_sizes 
        FROM public.products 
        WHERE id = NEW.product_id;

        -- Check if size exists in the map
        IF NEW.selected_size IS NOT NULL AND current_sizes ? NEW.selected_size THEN
            -- Update the quantity for that specific size
            current_sizes = jsonb_set(
                current_sizes, 
                ARRAY[NEW.selected_size], 
                to_jsonb(GREATEST(0, (current_sizes->>NEW.selected_size)::int - NEW.quantity))
            );
            
            -- Update the product record
            UPDATE public.products 
            SET sizes = current_sizes,
                stock = GREATEST(0, stock - NEW.quantity)
            WHERE id = NEW.product_id;
        ELSE
            -- If no size selected or size not in map, just reduce the main stock count
            UPDATE public.products 
            SET stock = GREATEST(0, stock - NEW.quantity)
            WHERE id = NEW.product_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Add trigger to order_items
DROP TRIGGER IF EXISTS tr_reduce_stock ON public.order_items;
CREATE TRIGGER tr_reduce_stock
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_stock_reduction();
