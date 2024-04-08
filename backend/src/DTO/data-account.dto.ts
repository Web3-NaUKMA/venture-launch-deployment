export interface ICreateDataAccountDto {
  accountHash: string;
  projectId: string;
}

export interface IUpdateDataAccountDto {
  accountHash: string;
}

export interface IFindDataAccountDto {
  id?: string;
  projectId?: { id: string };
  accountHash?: string;
}
