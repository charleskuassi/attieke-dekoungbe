const { Testimonial } = require('./models');

async function check() {
    try {
        const testimonials = await Testimonial.findAll();
        console.log("Found " + testimonials.length + " testimonials.");
        testimonials.forEach(t => {
            console.log(`ID: ${t.id}, Name: ${t.name}, Image Path: '${t.image}'`);
        });
    } catch (err) {
        console.error(err);
    }
}

check();
