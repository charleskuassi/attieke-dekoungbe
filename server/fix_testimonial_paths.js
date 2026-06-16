const { Testimonial } = require('./models');
const path = require('path');

async function fix() {
    try {
        const testimonials = await Testimonial.findAll();
        console.log(`Found ${testimonials.length} testimonials to check.`);
        
        for (const t of testimonials) {
            if (t.image) {
                console.log(`Checking ID ${t.id}: ${t.image}`);
                
                // Check if it looks like an absolute path or contains unnecessary parts
                // We want it to just be 'uploads/filename.ext'
                
                // If it contains "server\uploads" or "server/uploads"
                if (t.image.includes('uploads') && (t.image.includes(':') || t.image.startsWith('/') || t.image.includes('\\'))) {
                    const filename = path.basename(t.image);
                    const newPath = 'uploads/' + filename;
                    
                    console.log(`-> Updating to: ${newPath}`);
                    t.image = newPath;
                    await t.save();
                }
            }
        }
        console.log("Done.");
    } catch (error) {
        console.error("Error:", error);
    }
}

fix();
