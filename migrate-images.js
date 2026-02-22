import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://xyoidkfzbwsolaonpddk.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5b2lka2Z6Yndzb2xhb25wZGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NzAzOTAsImV4cCI6MjA4NzE0NjM5MH0.cPeW90f7EKE5TPcVmDezKb9byj4BSptI7s3Lgvb9kVk"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const sareeImages = [
    "https://images.unsplash.com/photo-1610030469983-98e550d6113c?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1621330396173-e41b1cafd17f?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611037000858-a5f119047b71?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1621814660388-349f7b607063?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1624386445995-bb049d56499a?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1623867086874-53909192484a?q=80&w=1000&auto=format&fit=crop"
];

async function migrate() {
    console.log('Starting image migration...');
    const { data: products, error } = await supabase.from('products').select('id, name');

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    console.log(`Found ${products.length} products. Updating images...`);

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        // Assign a random image from our high-quality list
        const imageToUse = sareeImages[i % sareeImages.length];

        const { error: updateError } = await supabase
            .from('products')
            .update({ image_url: imageToUse })
            .eq('id', product.id);

        if (updateError) {
            console.error(`Failed to update ${product.name}:`, updateError.message);
        } else {
            console.log(`Updated ${product.name} with reliable image.`);
        }
    }

    console.log('Migration complete! ✨');
}

migrate();
