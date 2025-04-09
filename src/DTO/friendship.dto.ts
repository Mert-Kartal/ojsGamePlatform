export interface CreateFriendshipDTO {
  friendId: number;
}

export interface UpdateFriendshipStatusDTO {
  status: "PENDING" | "ACCEPTED" | "BLOCKED";
}

export interface FriendshipResponseDTO {
  id: number;
  userId: number;
  friendId: number;
  status: "PENDING" | "ACCEPTED" | "BLOCKED";
  createdAt: Date;
  user: {
    id: number;
    username: string;
    profileImage?: string;
  };
  friend: {
    id: number;
    username: string;
    profileImage?: string;
  };
}
