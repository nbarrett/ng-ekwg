const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const attendee = {
  id: {type: String}
}

const recipient = {
  id: {type: String},
  order: {type: Number},
  memberGrouping: {type: String},
  text: {type: String}
}

const notification = {
  destinationType: {type: String},
  recipients: [recipient],
  addresseeType: {type: String},
  items: {
    title: {
      include: {type: Boolean}
    },
    notificationText: {
      include: {type: Boolean},
      value: {type: String}
    },
    description: {
      include: {type: Boolean}
    },
    attendees: {
      include: {type: Boolean}
    },
    attachment: {},
    replyTo: {
      include: {type: Boolean},
      value: {type: String}
    },
    signoffText: {
      include: {type: Boolean},
      value: {type: String}
    },
    signoffAs: {
      include: {type: Boolean},
      value: {type: String}
    }
  }
}
const socialEventSchema = mongoose.Schema({
  eventDate: {type: Number},
  attendees: [attendee],
  location: {type: String},
  briefDescription: {type: String},
  postcode: {type: String},
  eventTimeStart: {type: String},
  eventTimeEnd: {type: String},
  notification: notification,
  mailchimp: {
    segmentId: {type: Number},
    members: {
      success_count: {type: Number},
      error_count: {type: Number},
      errors: {type: Object},
    }
  },
  longerDescription: {type: String},
  eventContactMemberId: {type: String},
  displayName: {type: String},
  contactPhone: {type: String},
  contactEmail: {type: String},
  attachment: {
    originalFileName: {type: String},
    awsFileName: {type: String},
  },
  attachmentTitle: {type: String}
}, {collection: "socialEvents"});

socialEventSchema.plugin(uniqueValidator);

module.exports = mongoose.model("social-event", socialEventSchema);
