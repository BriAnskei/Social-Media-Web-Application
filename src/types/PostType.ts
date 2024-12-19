export interface PostType {
    createdAt: string;
    user: string;
    content: string;
    image: string;
    likes: string[];
    comments: {
        user: string;
        content: string;
        createdAt: string;
    }[];
}