export enum ReportType {
  BUG = 'BUG',
  FEEDBACK = 'FEEDBACK',
}

export enum Severity {
  INFO = 'INFO',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum ReportStatus {
  INIT = 'INIT',
  CONFIRMING = 'CONFIRMING',
  IN_PROCESSING = 'IN_PROCESSING',
  REJECTED = 'REJECTED',
  DONE = 'DONE',
}

export type ReportListItemEntity = {
  id: number
  name: string
  type: ReportType
  description: string
  severity?: Severity
  assignedTo?: number
  createdById: number
  projectId: number
  url: string
  status: ReportStatus
  createdAt: Date
  updatedAt: Date
}

export type ReportListResponse = {
  total: number
  items: ReportListItemEntity[]
}

export type Report = {
  id: number
  name: string
  type: ReportType
  severity?: Severity
  isPublic: boolean
  description: string
  url: string
  additionInfo?: AdditionInfo
  createdAt: Date
  updatedAt: Date
  createById: number
  assignTo: number
  projectId: number
  ReportImage?: ReportImage[]
  ReportComment?: ReportComment[]
}

export type ReportImage = {
  id?: number
  name: string
  path: string
  reportId?: number
}

export type ReportComment = {
  createdBy: {
    username: string
    avatar?: string
  }
  id: number
  createdById: number
  createdAt: Date
  updatedAt: Date
  content: string
  reportId: number
}

export type CreateReportDto = {
  id?: number
  name: string
  type: ReportType
  severity?: Severity
  isPublic: boolean
  description: string
  url: string
  additionInfo?: AdditionInfo
  images?: ReportImage[]
  newImages?: ReportImage[]
  deleteImages?: number[]
  projectId: number
}

export type CreateCommentDto = {
  content: string
}

export type EditCommentDto = {
  content: string
}

export type DOMitem = {
  domId: number
  message?: string
  domPath: string
}

export type AdditionInfo = {
  os?: string
  browser?: string
  isMobile?: boolean
  browserVersion?: string
  domPosition?: DOMitem[]
}

export const reformatResponse = (
  input: Report,
): {
  item: CreateReportDto
  comments?: ReportComment[]
} => {
  const {
    id,
    name,
    type,
    severity,
    isPublic,
    description,
    url,
    additionInfo,
    ReportImage,
    projectId,
  } = input
  return {
    item: {
      id,
      name,
      type,
      severity,
      isPublic,
      description,
      url,
      additionInfo,
      projectId,
      images: ReportImage,
    },
    comments: input.ReportComment,
  }
}