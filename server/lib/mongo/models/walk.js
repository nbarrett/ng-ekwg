const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const walkEvent = {
  data: {type: Object},
  eventType: {type: String},
  date: {type: Number},
  memberId: {type: String},
  notes: {type: String},
  description: {type: String},
  reason: {type: String}
}

const walkVenue = {
  venuePublish: {type: Boolean},
  type: {type: String},
  name: {type: String},
  address1: {type: String},
  address2: {type: String},
  postcode: {type: String},
  lat: {type: Number},
  lon: {type: Number},
  url: {type: String}
}

const walkSchema = mongoose.Schema({
  contactName: {type: String},
  walkType: {type: String},
  briefDescriptionAndStartPoint: {type: String},
  contactEmail: {type: String},
  contactId: {type: String},
  contactPhone: {type: String},
  displayName: {type: String},
  distance: {type: String},
  events: [walkEvent],
  grade: {type: String},
  gridReference: {type: String},
  location: {type: String},
  longerDescription: {type: String},
  config: {
    meetup: {
      defaultContent: {type: String},
      publishStatus: {type: String},
      guestLimit: {type: Number},
      announce: {type: Boolean}
    }
  },
  meetupEventTitle: {type: String},
  meetupEventDescription: {type: String},
  meetupEventUrl: {type: String},
  meetupPublish: {type: Boolean},
  nearestTown: {type: String},
  osMapsRoute: {type: String},
  osMapsTitle: {type: String},
  postcode: {type: String},
  ramblersWalkId: {type: String},
  ramblersPublish: {type: Boolean},
  startTime: {type: String},
  walkDate: {type: Number},
  walkLeaderMemberId: {type: String},
  venue: walkVenue
}, {collection: "walks"});

walkSchema.plugin(uniqueValidator);

module.exports = mongoose.model("walks", walkSchema);