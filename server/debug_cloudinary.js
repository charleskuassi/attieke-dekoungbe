const { cloudinary } = require('./config/cloudinary');

async function checkLibrary() {
    try {
        console.log("🔍 Checking Cloudinary Library via Admin API...");
        console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);

        const startTime = Date.now();
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'attieke_library',
            max_results: 10,
            direction: 'desc'
        });
        const duration = Date.now() - startTime;

        console.log(`✅ Success in ${duration}ms`);
        console.log(`Found ${result.resources.length} resources.`);
        if (result.resources.length > 0) {
            console.log("Sample:", result.resources[0].public_id);
        } else {
            console.log("No resources found with prefix 'attieke_library'.");
            // Try listing root to see if folder structure exists
            console.log("Attempting root list...");
            const rootResult = await cloudinary.api.resources({ max_results: 5 });
            console.log("Root sample:", rootResult.resources.map(r => r.public_id));
        }

    } catch (error) {
        console.error("❌ Error checking library:", error);
    }
}

checkLibrary();
