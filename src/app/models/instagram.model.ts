import { ApiResponse } from "./api-response.model";
import { ExpenseClaim } from "./expense.model";

export interface InstagramMediaPost {
  "id": string;
  "user": {
    "id": string;
    "full_name": string;
    "profile_picture": string;
    "username": string;
  };
  "images": {
    "thumbnail": {
      "width": number;
      "height": number;
      "url": string;
    };
    "low_resolution": {
      "width": number;
      "height": number;
      "url": string;
    };
    "standard_resolution": {
      "width": number;
      "height": number;
      "url": string;
    }
  };
  "created_time": string;
  "caption": {
    "id": string;
    "text": string;
    "created_time": string;
    "from": {
      "id": string;
      "full_name": string;
      "profile_picture": string;
      "username": string;
    }
  };
  "user_has_liked": false;
  "likes": {
    "count": number
  };
  "tags": [string];
  "filter": string;
  "comments": {
    "count": number
  };
  "type": string;
  "link": string;
  "location": string;
  "attribution": string;
  "users_in_photo": [];
  "carousel_media": [
    {
      "images": {
        "thumbnail": {
          "width": number;
          "height": number;
          "url": string;
        };
        "low_resolution": {
          "width": number;
          "height": number;
          "url": string;
        };
        "standard_resolution": {
          "width": number;
          "height": number;
          "url": string;
        }
      };
      "users_in_photo": [];
      "type": string;
    }
  ];
}

export interface InstagramMediaPostApiResponse extends ApiResponse {
  request: any;
  response?: InstagramMediaPost[];
}
