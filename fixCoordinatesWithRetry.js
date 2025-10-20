
require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('./models/listing'); // Adjust path if needed
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// MongoDB connection
mongoose.connect(process.env.DB_URL || 'mongodb://127.0.0.1:27017/your-db-name', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
    console.log('MongoDB connected.');

    try {
        const listingsToFix = await Listing.find({
            "geometry.coordinates": [-74.006, 40.7128] // Default NYC coords
        });

        console.log(`Found ${listingsToFix.length} listing(s) to fix.`);

        // Helper function for retries
        const geocodeWithRetry = async (location, retries = 3, delay = 1000) => {
            for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                    const response = await geocodingClient.forwardGeocode({
                        query: location,
                        limit: 1
                    }).send();

                    if (response.body.features.length > 0) {
                        return response.body.features[0].geometry;
                    } else {
                        console.warn(`Attempt ${attempt}: No coordinates found for "${location}"`);
                    }
                } catch (err) {
                    console.error(`Attempt ${attempt} error for "${location}":`, err.message);
                }

                // Wait before retrying
                if (attempt < retries) await new Promise(r => setTimeout(r, delay));
            }
            return null; // All retries failed
        };

        for (let listing of listingsToFix) {
            const location = listing.location + (listing.country ? `, ${listing.country}` : '');
            const geometry = await geocodeWithRetry(location);

            if (geometry) {
                listing.geometry = geometry;
                await listing.save();
                console.log(`✅ Updated coordinates for "${listing.title}":`, geometry.coordinates);
            } else {
                console.warn(`❌ Could not update coordinates for "${listing.title}" after retries`);
            }
        }

        console.log('✅ All listings processed.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
});
