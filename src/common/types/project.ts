import { ProjectRole } from './user'

export type Project = {
  id: number
  name: string
  projectThumbnail?: string
  description: string
  createdAt: Date
  updatedAt: Date
  userRole?: {
    name?: string
    category?: ProjectRole
  }
  ProjectDomain?: {
    url: string
  }[]
}

export type ProjectListResponse = {
  total: number
  items: Project[]
}
