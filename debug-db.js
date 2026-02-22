import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://xyoidkfzbwsolaonpddk.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5b2lka2Z6Yndzb2xhb25wZGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NzAzOTAsImV4cCI6MjA4NzE0NjM5MH0.cPeW90f7EKE5TPcVmDezKb9byj4BSptI7s3Lgvb9kVk"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
        console.error('ERROR:', error);
    } else {
        console.log('--- PRODUCT DATA ---');
        data.forEach((p, i) => {
            console.log(`Product ${i + 1}:`, {
                id: p.id,
                name: p.name,
                image_url: p.image_url,
                image: p.image,
                imageUrl: p.imageUrl,
                img: p.img,
                image_path: p.image_path
            });
        });
        console.log('--- ALL COLUMNS IN FIRST RECORD ---');
        if (data.length > 0) {
            console.log(Object.keys(data[0]));
        }
    }
}

test();
