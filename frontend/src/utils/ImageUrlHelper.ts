export const userProfile = (fileName: string, id: string) => {
  return fileName !== ""
    ? `http://localhost:4000/uploads/profile/${id}/${fileName}`
    : "http://localhost:4000/no-profile/no-profile.jpg";
};
