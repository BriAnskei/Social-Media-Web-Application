// Use For normalize state slices
export interface NormalizeState<T> {
  byId: { [key: string]: T };
  allIds: string[];
  loading: Boolean;
  error: string | null;
}

interface MessageState {
  loading: boolean;
}

export interface MessageNormalizeSate {
  // convoId: MessageSate
  byId: { [key: string]: MessageState };
  allIds: string[]; // contactId
  error: string;
}
