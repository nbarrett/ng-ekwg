const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const expenseTypeSchema = mongoose.Schema({
  value: {type: String},
  name: {type: String},
  travel: {type: Boolean},
});

const expenseItemSchema = mongoose.Schema({
  cost: {type: Number},
  description: {type: String},
  expenseType: expenseTypeSchema,
  expenseDate: {type: Number},
  travel: {
    costPerMile: {type: Number},
    miles: {type: Number},
    from: {type: String},
    to: {type: String},
    returnJourney: {type: Boolean}
  }
});

const expenseEventTypeSchema = mongoose.Schema({
  description: {type: String},
  atEndpoint: {type: Boolean},
  actionable: {type: Boolean},
  editable: {type: Boolean},
  returned: {type: Boolean},
  notifyCreator: {type: Boolean},
  notifyApprover: {type: Boolean},
});

const expenseEventSchema = mongoose.Schema({
  reason: {type: String},
  eventType: expenseEventTypeSchema,
  date: {type: Number},
  memberId: {type: String},
});

const expenseClaimSchema = mongoose.Schema({
  receipt: {title: {type: String}, fileNameData: {type: Object}},
  id: {type: String},
  expenseEvents: [expenseEventSchema],
  expenseItems: [expenseItemSchema],
  cost: {type: Number},
}, {collection: "expenseClaims"});

expenseClaimSchema.plugin(uniqueValidator);

module.exports = mongoose.model("expense-claim", expenseClaimSchema);

