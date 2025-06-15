export type NormalizeResponse<T> = {
  byId: { [key: string]: T };
  allIds: string[];
};

// Helper function that will returns an array or an object depinding on the api response
export const normalizeResponse = <T extends { _id: string }>(
  data: T[] | T | undefined
): NormalizeResponse<T> => {
  if (!data) return { byId: {}, allIds: [] };

  if (Array.isArray(data)) {
    return {
      byId: data.reduce((acc, user) => {
        acc[user._id] = user;
        return acc;
      }, {} as { [key: string]: T }),
      allIds: data.map((user) => user._id),
    };
  } else {
    return {
      byId: { [data._id]: data },
      allIds: [data._id],
    };
  }
};
