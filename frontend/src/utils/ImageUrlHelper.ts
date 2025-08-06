export const userProfile = (fileName: string | undefined, id: string) => {
  return fileName && fileName !== ""
    ? `http://localhost:4000/uploads/profile/${id}/${fileName}`
    : "http://localhost:4000/no-profile/no-profile.jpg";
};

export const getMessageImageUrl = (
  fileName: string,
  userId: string,
  conversationId: string
): string => {
  return `http://localhost:4000/message/images/${conversationId}/${userId}/${fileName}`;
};
