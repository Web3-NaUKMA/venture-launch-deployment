export interface Chat {
  id: string;
  title: string;
  image?: string | null;
  description?: string | null;
  isGroup: boolean;
  isArchived: boolean;
  isFavourite: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
  removedAt?: Date | null;
}
