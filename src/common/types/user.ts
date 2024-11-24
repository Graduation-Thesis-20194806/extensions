export type LoginDto = {
  email: string
  password: string
}

export enum ProjectRole {
  OWNER = 'OWNER',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST',
}
