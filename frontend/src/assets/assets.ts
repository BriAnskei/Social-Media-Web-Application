export const exampleConversations = [
  {
    _id: "5f8d0d55b54764421b7156da",
    participants: [
      "5f8d0d55b54764421b7156d1", // User 1
      "5f8d0d55b54764421b7156d2", // User 2
    ],
    lastMessage: "5f8d0d55b54764421b7156e1",
    lastMessageAt: new Date("2023-05-15T14:30:00Z").toISOString(),
    unreadCounts: [
      {
        user: "5f8d0d55b54764421b7156d1",
        count: 3,
      },
      {
        user: "5f8d0d55b54764421b7156d2",
        count: 0,
      },
    ],
    createdAt: new Date("2023-05-10T09:15:00Z").toISOString(),
    updatedAt: new Date("2023-05-15T14:30:00Z").toISOString(),
  },
  {
    _id: "5f8d0d55b54764421b7156db",
    participants: [
      "5f8d0d55b54764421b7156d1", // User 1
      "5f8d0d55b54764421b7156d3", // User 3
    ],
    lastMessage: "5f8d0d55b54764421b7156e4",
    lastMessageAt: new Date("2023-05-14T11:20:00Z").toISOString(),
    unreadCounts: [
      {
        user: "5f8d0d55b54764421b7156d1",
        count: 0,
      },
      {
        user: "5f8d0d55b54764421b7156d3",
        count: 1,
      },
    ],
    createdAt: new Date("2023-05-05T16:45:00Z").toISOString(),
    updatedAt: new Date("2023-05-14T11:20:00Z").toISOString(),
  },
];

export const exampleMessages = [
  {
    _id: "5f8d0d55b54764421b7156e1",
    sender: "5f8d0d55b54764421b7156d2",
    recipient: "5f8d0d55b54764421b7156d1",
    content: "Hey, how are you doing?",

    read: false,
    readAt: null,
    conversationId: "5f8d0d55b54764421b7156da",
    createdAt: new Date("2023-05-10T14:30:00Z").toISOString(),
    updatedAt: new Date("2023-05-10T14:30:00Z").toISOString(),
  },
  {
    _id: "5f8d0d55b54764421b7156e2",
    sender: "5f8d0d55b54764421b7156d1",
    recipient: "5f8d0d55b54764421b7156d2",
    content: "I'm good, thanks! How about you?",

    read: true,
    attachments:
      "https://img.freepik.com/free-photo/sunset-time-tropical-beach-sea-with-coconut-palm-tree_74190-1075.jpg?semt=ais_hybrid&w=740",
    readAt: new Date("2023-05-15T14:32:00Z").toISOString(),
    conversationId: "5f8d0d55b54764421b7156da",
    createdAt: new Date("2023-05-15T14:31:00Z").toISOString(),
    updatedAt: new Date("2023-05-15T14:32:00Z").toISOString(),
  },
  {
    _id: "5f8d0d55b54764421b7156e3",
    sender: "5f8d0d55b54764421b7156d2",
    recipient: "5f8d0d55b54764421b7156d1",
    content: "Doing well! Check out this photo I took yesterday",
    attachments:
      "https://img.freepik.com/free-photo/sunset-time-tropical-beach-sea-with-coconut-palm-tree_74190-1075.jpg?semt=ais_hybrid&w=740",
    read: false,
    readAt: null,
    conversationId: "5f8d0d55b54764421b7156da",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "5f8d0d55b54764421b7156e4",
    sender: "5f8d0d55b54764421b7156d1",
    recipient: "5f8d0d55b54764421b7156d3",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborumLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborumLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborumLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborumLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",

    read: false,
    readAt: null,
    conversationId: "5f8d0d55b54764421b7156db",
    createdAt: new Date("2023-05-14T11:20:00Z").toISOString(),
    updatedAt: new Date("2023-05-14T11:20:00Z").toISOString(),
  },
  {
    _id: "5f8d0d55b54764421b7156e5",
    sender: "5f8d0d55b54764421b7156d3",
    recipient: "5f8d0d55b54764421b7156d1",
    content: "Yes, at the coffee shop at 2pm",

    read: true,
    readAt: new Date("2023-05-14T11:25:00Z").toISOString(),
    conversationId: "5f8d0d55b54764421b7156db",
    createdAt: new Date("2023-05-14T11:22:00Z").toISOString(),
    updatedAt: new Date("2023-05-14T11:25:00Z").toISOString(),
  },
];

export const contactList = [
  {
    profile:
      "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg",
    name: "Example name",
  },
  {
    profile:
      "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg",
    name: "Example name",
  },
  {
    profile:
      "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg",
    name: "Example name",
  },
  {
    profile:
      "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg",
    name: "Example name",
  },

  {
    profile:
      "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg",
    name: "Example name",
  },
  {
    profile:
      "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg",
    name: "Example name",
  },
  {
    profile:
      "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg",
    name: "Example name",
  },
  {
    profile:
      "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg",
    name: "Example name",
  },
  {
    profile:
      "https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/24e953b920a9cd0ff2e1d587742a2472/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg",
    name: "Example name",
  },
];
