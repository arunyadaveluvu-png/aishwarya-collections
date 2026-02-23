-- Migration: Advanced Inventory Management
-- 1. Convert sizes from text[] to jsonb
ALTER TABLE public.products 
ALTER COLUMN sizes DROP DEFAULT;

ALTER TABLE public.products 
ALTER COLUMN sizes TYPE jsonb USING (
  CASE 
    WHEN sizes IS NULL THEN '{}'::jsonb
    ELSE (
      SELECT jsonb_object_agg(v, 10) -- Default quantity of 10 for existing sizes
      FROM unnest(sizes) AS v
    )
  END
);

ALTER TABLE public.products 
ALTER COLUMN sizes SET DEFAULT '{}'::jsonb;

-- 2. Create function to reduce stock on order
CREATE OR REPLACE FUNCTION public.handle_stock_reduction()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
    current_sizes jsonb;
    current_total_stock int;
BEGIN
    -- Loop through all items in the order via order_items table
    -- Note: This trigger should run AFTER order is inserted or AFTER order_items are inserted.
    -- Better to run it on order_items insertion.
    
    -- If trigger is on order_items:
    IF (TG_OP = 'INSERT') THEN
        -- Get current product data
        SELECT sizes, stock INTO current_sizes, current_total_stock
        FROM public.products
        WHERE id = NEW.product_id;

        -- If a size was selected
        IF NEW.selected_size IS NOT NULL AND current_sizes ? NEW.selected_size THEN
            -- Decrement size-specific quantity
            current_sizes = jsonb_set(
                current_sizes, 
                ARRAY[NEW.selected_size], 
                to_jsonb(GREATEST(0, (current_sizes->>NEW.selected_size)::int - NEW.quantity))
            );
            
            -- Update product
            UPDATE public.products 
            SET sizes = current_sizes,
                stock = GREATEST(0, stock - NEW.quantity)
            WHERE id = NEW.product_id;
        ELSE
            -- No size selected or size not in map, just reduce main stock
            UPDATE public.products 
            SET stock = GREATEST(0, stock - NEW.quantity)
            WHERE id = NEW.product_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Add trigger to order_items
DROP TRIGGER IF EXISTS tr_reduce_stock ON public.order_items;
CREATE TRIGGER tr_reduce_stock
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.handle_stock_reduction();
