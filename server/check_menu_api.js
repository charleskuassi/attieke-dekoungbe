const axios = require('axios');

async function checkMenu() {
    try {
        console.log("Testing GET http://localhost:5000/api/products...");
        const res = await axios.get('http://localhost:5000/api/products');
        console.log("Status:", res.status);
        console.log("Is Array?", Array.isArray(res.data));
        console.log("Length:", res.data ? res.data.length : 'N/A');
        if (Array.isArray(res.data) && res.data.length > 0) {
            console.log("First Item:", res.data[0]);
        } else {
            console.log("Data:", res.data);
        }
    } catch (err) {
        console.error("Error fetching menu:", err.message);
        if (err.response) {
            console.log("Response Status:", err.response.status);
            console.log("Response Data:", err.response.data);
        }
    }
}

checkMenu();
