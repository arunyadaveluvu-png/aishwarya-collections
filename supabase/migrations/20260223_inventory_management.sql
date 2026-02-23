-- Migration: Advanced Inventory Management (Super Safe Version)
-- This script is idempotent (safe to run multiple times)

DO $$ 
BEGIN
    -- 1. Check if 'sizes' is still an ARRAY (the old format)
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'products' 
        AND column_name = 'sizes' 
        AND (data_type = 'ARRAY' OR udt_name = '_text')
    ) THEN
        -- Rename old column to keep a backup during the statement
        ALTER TABLE public.products RENAME COLUMN sizes TO sizes_old;
        
        -- Create new jsonb column
        ALTER TABLE public.products ADD COLUMN sizes jsonb DEFAULT '{}'::jsonb;
        
        -- Migrate data from text[] to jsonb
        UPDATE public.products 
        SET sizes = (
          SELECT COALESCE(jsonb_object_agg(size, 10), '{}'::jsonb)
          FROM unnest(sizes_old) AS size
        )
        WHERE sizes_old IS NOT NULL AND array_length(sizes_old, 1) > 0;
        
        -- Clean up backup
        ALTER TABLE public.products DROP COLUMN sizes_old;
        
        RAISE NOTICE 'Successfully migrated sizes to JSONB map.';
    ELSE
        RAISE NOTICE 'Sizes column is already JSONB. Skipping migration.';
    END IF;
END $$;

-- 2. Ensure 'sizes' has a default empty object in case it's null
ALTER TABLE public.products ALTER COLUMN sizes SET DEFAULT '{}'::jsonb;
UPDATE public.products SET sizes = '{}'::jsonb WHERE sizes IS NULL;

-- 3. Create/Update the stock reduction function
-- This handles both size-specific and general stock reduction
CREATE OR REPLACE FUNCTION public.handle_stock_reduction()
RETURNS TRIGGER AS $$
DECLARE
    current_sizes jsonb;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Fetch current product inventory
        SELECT sizes INTO current_sizes FROM public.products WHERE id = NEW.product_id;
        
        -- If size was selected and exists in our map, reduce size-specific stock
        IF NEW.selected_size IS NOT NULL AND jsonb_typeof(current_sizes) = 'object' AND current_sizes ? NEW.selected_size THEN
            current_sizes = jsonb_set(
                current_sizes, 
                ARRAY[NEW.selected_size], 
                to_jsonb(GREATEST(0, (current_sizes->>NEW.selected_size)::int - NEW.quantity))
            );
            
            -- Update both the map and the total stock count
            UPDATE public.products 
            SET sizes = current_sizes, 
                stock = GREATEST(0, stock - NEW.quantity) 
            WHERE id = NEW.product_id;
        ELSE
            -- Fallback: Just reduce the general stock count
            UPDATE public.products 
            SET stock = GREATEST(0, stock - NEW.quantity) 
            WHERE id = NEW.product_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Re-apply the trigger to order_items
DROP TRIGGER IF EXISTS tr_reduce_stock ON public.order_items;
CREATE TRIGGER tr_reduce_stock 
AFTER INSERT ON public.order_items 
FOR EACH ROW 
EXECUTE FUNCTION public.handle_stock_reduction();
