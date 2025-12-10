#!/usr/bin/env node
/**
 * Test Upload System
 * This script tests the image upload endpoint
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function testUpload() {
    console.log('🧪 Testing Upload System...\n');
    console.log(`API URL: ${API_URL}\n`);

    try {
        // Create a small test image (1x1 pixel PNG)
        const pngBuffer = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xF8, 0x0F, 0x00, 0x00,
            0x01, 0x01, 0x01, 0x00, 0x1B, 0xB6, 0xEE, 0x56, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
            0xAE, 0x42, 0x60, 0x82
        ]);

        const tempFile = path.join(__dirname, 'test_image.png');
        fs.writeFileSync(tempFile, pngBuffer);
        console.log('✓ Created test image\n');

        // Create FormData and send request
        const FormData = require('form-data');
        const form = new FormData();
        form.append('image', fs.createReadStream(tempFile), 'test_image.png');

        console.log('📤 Uploading test image...');
        const response = await axios.post(`${API_URL}/api/upload`, form, {
            headers: form.getHeaders()
        });

        console.log('\n✅ Upload successful!');
        console.log('\nResponse:');
        console.log(JSON.stringify(response.data, null, 2));

        if (response.data.imageUrl) {
            console.log(`\n📁 Image accessible at: ${API_URL}${response.data.imageUrl}`);
        }

        // Cleanup
        fs.unlinkSync(tempFile);
        console.log('\n✓ Cleanup complete');

    } catch (error) {
        console.error('\n❌ Upload failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
}

testUpload();
