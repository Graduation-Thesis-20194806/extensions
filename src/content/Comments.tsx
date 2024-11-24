import { ViewMode } from '@/common/constant'
import {
  CreateCommentDto,
  EditCommentDto,
  ReportComment,
} from '@/common/types/report'
import { formatDate } from '@/utils/date'
import { EditOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Button, Divider, Flex, Segmented, Space } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
type Props = {
  user_id: number
  items?: ReportComment[]
  onCreateComment: (createComment: CreateCommentDto) => void
  onEditComment: (id: number, editComment: EditCommentDto) => void
  onChangeViewMode: (value: ViewMode) => void
  visible: boolean
}
type CommentCardProps = {
  item: ReportComment
  editable: boolean
  onEditComment: (id: number, editComment: EditCommentDto) => void
}

function CommentCard({ item, editable, onEditComment }: CommentCardProps) {
  const [isEditing, setEditing] = useState<boolean>(false)
  const [comment, setComment] = useState<string | undefined>(item.content)
  useEffect(() => {
    setComment(item.content)
  }, [item.content])
  return (
    <CommentCardContainer>
      {item.createdBy.avatar ? (
        <Avatar src={<img src={item.createdBy.avatar} alt="avatar" />} />
      ) : (
        <Avatar icon={<UserOutlined />} />
      )}
      <div style={{ flexGrow: 1 }}>
        <Flex justify="space-between" style={{ marginBottom: 8 }}>
          <Space>
            <UserName>{item.createdBy.username}</UserName>
            <Timer>
              {item.createdAt === item.updatedAt
                ? formatDate(item.createdAt)
                : `edited at ${formatDate(item.updatedAt)}`}
            </Timer>
          </Space>
          <Space>
            {editable && (
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setEditing((isEditing) => !isEditing)
                  setComment(item.content)
                }}
                variant={isEditing ? 'filled' : 'outlined'}
              />
            )}
          </Space>
        </Flex>
        <CommentEditFlex align="flex-start" gap={8}>
          <CommentEditTextArea
            placeholder="Write some thing"
            autoSize={{
              minRows: 1,
              maxRows: 7,
            }}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={!isEditing}
          />
          {isEditing && (
            <Button
              color="primary"
              onClick={() => {
                onEditComment(item.id, { content: comment ?? '' })
                setEditing(false)
              }}
              disabled={!comment}
            >
              Post
            </Button>
          )}
        </CommentEditFlex>
      </div>
    </CommentCardContainer>
  )
}

function Comments({
  user_id,
  items,
  onChangeViewMode,
  onCreateComment,
  onEditComment,
  visible,
}: Props) {
  const [comment, setComment] = useState<string | undefined>()
  return (
    <CommentsContainer style={{ display: visible ? 'block' : 'none' }}>
      <CommentHeaderContainer>
        <Flex align="center" justify="space-between" gap={4}>
          <Segmented<ViewMode>
            options={[ViewMode.REPORT, ViewMode.COMMENTS]}
            onChange={onChangeViewMode}
            value={ViewMode.COMMENTS}
          />
          <CommentsTotal>{`${items?.length ?? 0} comment${
            items?.length && items.length > 1 ? 's' : ''
          }`}</CommentsTotal>
        </Flex>
        <Divider style={{ marginBlock: 16 }} />
        <CommentEditFlex align="flex-start" gap={8}>
          <CommentEditTextArea
            placeholder="Write some thing"
            autoSize={{
              minRows: 1,
              maxRows: 7,
            }}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button
            color="primary"
            onClick={() => {
              onCreateComment({ content: comment ?? '' })
              setComment(undefined)
            }}
            disabled={!comment}
          >
            Post
          </Button>
        </CommentEditFlex>
      </CommentHeaderContainer>
      <Flex vertical gap={16}>
        {items?.map((item) => (
          <CommentCard
            item={item}
            onEditComment={onEditComment}
            editable={user_id === item.createdById}
          />
        ))}
      </Flex>
    </CommentsContainer>
  )
}

export default Comments

const CommentsContainer = styled.div`
  position: relative;
  max-height: calc(100% - 32px);
  overflow-y: auto;
`
const CommentHeaderContainer = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  padding-bottom: 24px;
`

const CommentsTotal = styled.div`
  font-size: 18px;
  front-weight: bold;
  color: grey;
`
const CommentEditFlex = styled(Flex)``

const CommentEditTextArea = styled(TextArea)`
  border-radius: 0 !important;
  border-left: 0 !important;
  border-right: 0 !important;
  border-top: 0 !important;
  background: transparent;

  &[disabled] {
    background: transparent;
    border: 0 !important;
  }
`
const CommentCardContainer = styled.div`
  display: flex;
  gap: 8px;
`

const UserName = styled.span`
  font-size: 14px;
  font-weight: bold;
`
const Timer = styled.span`
  font-size: 10px;
  font-weight: normal;
  color: lightgrey;
`
