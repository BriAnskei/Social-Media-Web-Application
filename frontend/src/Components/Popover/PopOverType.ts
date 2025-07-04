export interface PopoverDeletePost {
  target: React.MutableRefObject<null>;
  show: boolean;
}

export interface PopoverDeleteConvoType {
  show: boolean;
  target: React.MutableRefObject<null> | any;
  convoId: string;
}
