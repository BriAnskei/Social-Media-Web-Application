export const messages = [
  {
    sender: "64cb8ae5c7e9e3d04d7321a1", // Replace with valid ObjectId
    receiver: "64cb8ae5c7e9e3d04d7321a2", // Replace with valid ObjectId
    content: "Hey, how are you?",
    isRead: false,
    createdAt: new Date("2024-12-12T09:30:00Z"),
  },
  {
    sender: "64cb8ae5c7e9e3d04d7321a2",
    receiver: "64cb8ae5c7e9e3d04d7321a1",
    content: "I'm good! How about you?",
    isRead: false,
    createdAt: new Date("2024-12-12T09:32:00Z"),
  },
  {
    sender: "64cb8ae5c7e9e3d04d7321a3",
    receiver: "64cb8ae5c7e9e3d04d7321a1",
    content: "Are you coming to the meeting later?",
    isRead: true,
    createdAt: new Date("2024-12-13T11:00:00Z"),
  },
  {
    sender: "64cb8ae5c7e9e3d04d7321a1",
    receiver: "64cb8ae5c7e9e3d04d7321a3",
    content: "Yes, I'll be there at 2 PM.",
    isRead: true,
    createdAt: new Date("2024-12-13T11:05:00Z"),
  },
  {
    sender: "64cb8ae5c7e9e3d04d7321a4",
    receiver: "64cb8ae5c7e9e3d04d7321a2",
    content: "Happy Birthday! 🎉",
    isRead: false,
    createdAt: new Date("2024-12-14T07:00:00Z"),
  },
];

export const images = [
  // Random image from Lorem Picsum
  "https://picsum.photos/600/400",

  // Specific image by ID from Lorem Picsum
  "https://picsum.photos/id/237/600/400",

  // Customized image from Placehold.co with black background and white text
  "https://placehold.co/600x400/000000/FFFFFF.png?text=Placeholder",

  // Category-specific image from LoremFlickr (e.g., nature)
  "https://loremflickr.com/600/400/nature",

  // Another category-specific image from LoremFlickr (e.g., technology)
  "https://loremflickr.com/600/400/technology",
  // Random image from Lorem Picsum
  "https://picsum.photos/600/400",

  // Specific image by ID from Lorem Picsum
  "https://picsum.photos/id/237/600/400",

  // Customized image from Placehold.co with black background and white text
  "https://placehold.co/600x400/000000/FFFFFF.png?text=Placeholder",

  // Category-specific image from LoremFlickr (e.g., nature)
  "https://loremflickr.com/600/400/nature",

  // Another category-specific image from LoremFlickr (e.g., technology)
  "https://loremflickr.com/600/400/technology",
  // Random image from Lorem Picsum
  "https://picsum.photos/600/400",

  // Specific image by ID from Lorem Picsum
  "https://picsum.photos/id/237/600/400",

  // Customized image from Placehold.co with black background and white text
  "https://placehold.co/600x400/000000/FFFFFF.png?text=Placeholder",

  // Category-specific image from LoremFlickr (e.g., nature)
  "https://loremflickr.com/600/400/nature",

  // Another category-specific image from LoremFlickr (e.g., technology)
  "https://loremflickr.com/600/400/technology",
  // Random image from Lorem Picsum
  "https://picsum.photos/600/400",

  // Specific image by ID from Lorem Picsum
  "https://picsum.photos/id/237/600/400",

  // Customized image from Placehold.co with black background and white text
  "https://placehold.co/600x400/000000/FFFFFF.png?text=Placeholder",

  // Category-specific image from LoremFlickr (e.g., nature)
  "https://loremflickr.com/600/400/nature",

  // Another category-specific image from LoremFlickr (e.g., technology)
  "https://loremflickr.com/600/400/technology",
  // Random image from Lorem Picsum
  "https://picsum.photos/600/400",

  // Specific image by ID from Lorem Picsum
  "https://picsum.photos/id/237/600/400",

  // Customized image from Placehold.co with black background and white text
  "https://placehold.co/600x400/000000/FFFFFF.png?text=Placeholder",

  // Category-specific image from LoremFlickr (e.g., nature)
  "https://loremflickr.com/600/400/nature",

  // Another category-specific image from LoremFlickr (e.g., technology)
  "https://loremflickr.com/600/400/technology",
  // Random image from Lorem Picsum
  "https://picsum.photos/600/400",

  // Specific image by ID from Lorem Picsum
  "https://picsum.photos/id/237/600/400",

  // Customized image from Placehold.co with black background and white text
  "https://placehold.co/600x400/000000/FFFFFF.png?text=Placeholder",

  // Category-specific image from LoremFlickr (e.g., nature)
  "https://loremflickr.com/600/400/nature",

  // Another category-specific image from LoremFlickr (e.g., technology)
  "https://loremflickr.com/600/400/technology",
  // Random image from Lorem Picsum
  "https://picsum.photos/600/400",

  // Specific image by ID from Lorem Picsum
  "https://picsum.photos/id/237/600/400",

  // Customized image from Placehold.co with black background and white text
  "https://placehold.co/600x400/000000/FFFFFF.png?text=Placeholder",

  // Category-specific image from LoremFlickr (e.g., nature)
  "https://loremflickr.com/600/400/nature",

  // Another category-specific image from LoremFlickr (e.g., technology)
  "https://loremflickr.com/600/400/technology",
];

// Example data for the notificationSchema
export const exampleNotifications = [
  {
    receiver: "63df4b5e4e3interc4b4567d89f10", // User ID of the recipient
    sender: "63df4b5e4e3c4b4567d89f20", // User ID of the sender
    type: "like", // Type of notification
    post: "63df4b5e4e3c4b4567d89f30", // Post ID (optional, only for post-related notifications)
    message: "John liked your post.", // Optional message
    read: false, // Notification has not been read
    createdAt: new Date("2024-12-14T10:15:00Z"), // Custom date
  },
  {
    receiver: "63df4b5e4e3c4b4567d89f40",
    sender: "63df4b5e4e3c4b4567d89f50",
    type: "comment",
    post: "63df4b5e4e3c4b4567d89f60",
    message: "Anna commented on your post: 'Great work!'",
    read: true,
    createdAt: new Date("2024-12-15T08:30:00Z"),
  },
  {
    receiver: "63df4b5e4e3c4b4567d89f70",
    sender: "63df4b5e4e3c4b4567d89f80",
    type: "follow",
    message: "Michael started following you.",
    read: false,
    createdAt: new Date("2024-12-15T15:45:00Z"),
  },
  {
    receiver: "63df4b5e4e3c4b4567d89f90",
    sender: "63df4b5e4e3c4b4567d89fa0",
    type: "like",
    post: "63df4b5e4e3c4b4567d89fb0",
    message: "Emily liked your post.",
    read: false,
    createdAt: new Date(), // Current date and time
  },
];

export const posts = [
  {
    _id: "64e3f1b9c6b2e1f4a1b67892",
    user: "Brian Ebrahim", // Replace with valid ObjectId
    content: "This is my first post! Excited to share my thoughts.",
    image:
      "https://www.tomorrowsworldtoday.com/wp-content/uploads/2022/02/Nature-Enthusiast-Travel-Tips-Outdoors.jpg",
    likes: ["64e3f1b9c6b2e1f4a1b67890", "64e3f1b9c6b2e1f4a1b67891"],
    comments: [
      {
        user: "64e3f1b9c6b2e1f4a1b67892",
        content: "Congrats on your first post!",
        createdAt: new Date("2024-08-01T10:00:00"),
      },
      {
        user: "64e3f1b9c6b2e1f4a1b67893",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Exc.",
        createdAt: new Date("2024-08-01T12:00:00"),
      },
      {
        user: "64e3f1b9c6b2e1f4a1b67892",
        content: "Congrats on your first post!",
        createdAt: new Date("2024-08-01T10:00:00"),
      },
      {
        user: "64e3f1b9c6b2e1f4a1b67893",
        content: "Nice post! Keep it up.",
        createdAt: new Date("2024-08-01T12:00:00"),
      },
      {
        user: "64e3f1b9c6b2e1f4a1b67892",
        content: "Congrats on your first post!",
        createdAt: new Date("2024-08-01T10:00:00"),
      },
      {
        user: "64e3f1b9c6b2e1f4a1b67893",
        content: "Nice post! Keep it up.",
        createdAt: new Date("2024-08-01T12:00:00"),
      },
    ],
    createdAt: new Date("2024-08-01T08:00:00"),
  },
  {
    user: "64e3f1b9c6b2e1f4a1b67894",
    content: "Loving the weather today! ☀️🌳",
    image:
      "https://bsd.uk.com/wp-content/uploads/2014/10/Web-pics-81014-001-1.jpg",
    likes: [
      "64e3f1b9c6b2e1f4a1b67895",
      "64e3f1b9c6b2e1f4a1b67896",
      "64e3f1b9c6b2e1f4a1b67897",
    ],
    comments: [
      {
        user: "64e3f1b9c6b2e1f4a1b67898",
        content: "I agree, it's beautiful outside!",
        createdAt: new Date("2024-08-02T14:00:00"),
      },
    ],
    createdAt: new Date("2024-08-02T10:00:00"),
  },
  {
    user: "64e3f1b9c6b2e1f4a1b67899",
    content: "Check out this cool sunset I captured last evening.",
    image: "https://example.com/sunset.jpg",
    likes: [],
    comments: [],
    createdAt: new Date("2024-08-03T18:30:00"),
  },
  {
    user: "64e3f1b9c6b2e1f4a1b12346",
    content: "Anyone recommend a good book to read?",
    image: "",
    likes: ["64e3f1b9c6b2e1f4a1b67890"],
    comments: [
      {
        user: "64e3f1b9c6b2e1f4a1b12347",
        content: "Try 'Atomic Habits' by James Clear, it's amazing!",
        createdAt: new Date("2024-08-04T15:45:00"),
      },
    ],
    createdAt: new Date("2024-08-04T13:00:00"),
  },
];
