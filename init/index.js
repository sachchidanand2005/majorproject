// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Listing = require("../models/listing.js");

// const MONGO_URL ="mongodb://127.0.0.1:27017/wanderlust";

// main()
// .then(()=>{
//     console.log("connected to db");
// })
// .catch((err)=>{
//     console.log(err);
// });

// async function main() {
//     await mongoose.connect(MONGO_URL);
// }
 
// const initDB = async ()=>{
//     await Listing.deleteMany({});
//     initData.data = initData.data.map((obj)=>({...obj, owner: '68ec73fabfa692beb5e2cbcc'}));
//     await Listing.insertMany(initData.data);
//     console.log("Data was initialize");
// };

// initDB();




console.log("🚀 Running THIS index.js file");

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    const count = await Listing.countDocuments();
    if (count === 0) {
        await Listing.insertMany(initData.data);
        console.log("✅ Data was initialized");
    } else {
        console.log("⚡ DB already has data, skipping initialization");
    }
};

async function run() {
    try {
        await main();
        console.log("connected to db");
        await initDB();
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

run();
