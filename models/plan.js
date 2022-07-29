const mongoose = require("mongoose");

const PlanSchema = mongoose.Schema({
    weeks: [{
        number: Number,
    }]
});

const Plan = mongoose.model("Plan", PlanSchema);

Plan.createIndexes();

module.exports = Plan;