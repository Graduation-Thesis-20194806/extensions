/* eslint-disable no-console */
import { ProjectOutlined } from '@ant-design/icons'
import { useContext, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { RouterContext, RouterEnum } from '.'
import {
  Button,
  Pagination,
  Segmented,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import { getMyReports } from '@/services/report'
import { ReportListItemEntity } from '@/common/types/report'
import { ActionKey, APP_STATE_KEY } from '@/common/constant'
import { forceSaveAppState } from '@/app/chromeStorage'
import { ProjectRole } from '@/common/types/user'
enum TabEnum {
  ALL = 'all',
  ASSIGNED = 'assigned',
  OWNER = 'owner',
}

const ListItem = ({ item }: { item: ReportListItemEntity }) => {
  const handleClick = (item: ReportListItemEntity) => {
    chrome.runtime.sendMessage(
      {
        action: ActionKey.OPEN_REPORT,
        payload: { url: item.url, id: item.id },
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError)
        } else {
          console.log('Response from background:', response.greeting)
        }
      },
    )
  }
  return (
    <ListItemContainer className="list-item-container">
      <Space>
        <p className="label">{item.name}</p>
        <Tag>{item.type}</Tag>
        <Tag>{item.severity}</Tag>
        <Tag>{item.status}</Tag>
      </Space>
      <Tooltip title={item.url}>
        <Typography.Text
          ellipsis
          className="url"
          onClick={() => handleClick(item)}
        >
          {item.url}
        </Typography.Text>
      </Tooltip>
    </ListItemContainer>
  )
}

function Popup() {
  const { appState, setRouter } = useContext(RouterContext)
  const [listReports, setListReports] = useState<ReportListItemEntity[]>()
  const [page, setPage] = useState(1)
  const [tab, setTab] = useState<TabEnum>(TabEnum.OWNER)
  const [total, setTotal] = useState(0)
  useEffect(() => {
    if (!appState?.projectId) return
    getMyReports(appState.projectId, tab, page).then((res) => {
      if (!res) return
      const { total, items } = res
      setTotal(total)
      setListReports(items)
    })
  }, [tab, page, appState.projectId])
  const options = useMemo(() => {
    const base = [TabEnum.OWNER]
    const per = appState?.permission
    if (!per || per == ProjectRole.GUEST) return base
    base.push(TabEnum.ASSIGNED)
    if (per == ProjectRole.MEMBER) return base
    return [...base, TabEnum.ALL]
  }, [appState?.permission])
  return (
    <PopupContainer>
      <ProjectTitleContainer>
        <Space>
          <ProjectOutlined style={{ fontSize: 20 }} />
          <h2>{appState?.projectName}</h2>
        </Space>
        <Button
          type="primary"
          onClick={async () => {
            await forceSaveAppState(
              {
                ...appState,
                projectId: undefined,
                projectName: undefined,
                projectDomains: undefined,
                permission: undefined,
              },
              APP_STATE_KEY,
            )
            setRouter(RouterEnum.CHANGE_PROJECT)
          }}
        >
          Change
        </Button>
      </ProjectTitleContainer>
      <Segmented<TabEnum>
        options={options}
        value={tab}
        onChange={(value) => {
          setTab(value)
          setPage(1)
        }}
        style={{ width: '100%' }}
      />
      <ListContainer>
        {listReports?.map((item) => (
          <ListItem key={item.id} item={item} />
        ))}
      </ListContainer>
      <Pagination
        current={page}
        total={total}
        onChange={(page) => setPage(page)}
      />
    </PopupContainer>
  )
}
const PopupContainer = styled.div`
  padding-block: 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
`
const ProjectTitleContainer = styled.div`
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 8px;
  border: 1px solid var(--primary-color);
  background: var(--light-primary-color);
  width: 100%;
`

const ListItemContainer = styled.div`
  padding-inline: 8px;
  &:hover {
    background: #f5f5f5;
  }
  & .label {
    font-size: 16px;
    font-weight: bold;
  }

  & .url {
    font-style: italic;
    font-size: 14px;
    cursor: pointer;
  }
  & .url:hover {
    text-decoration: underline;
  }
`
const ListContainer = styled.div`
  width: 100%;
  max-height: 360px;
  overflow-y: auto;
  & > .list-item-container:not(:last-child) {
    border-bottom: 1px solid lightgrey;
  }
`
export default Popup
