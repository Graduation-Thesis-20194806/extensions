import { getMyProjects } from '@/services/project'
import { useCallback, useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { RouterContext, RouterEnum } from '.'
import { Flex, List, Pagination, Typography } from 'antd'
import { Project } from '@/common/types/project'
import Alert from 'antd/es/alert/Alert'
import { clearState, saveAppState } from '@/app/chromeStorage'
import { APP_REPORT_TAB_KEY, APP_STATE_KEY } from '@/common/constant'
import { ProjectRole } from '@/common/types/user'
const { Paragraph } = Typography
function ChooseProject() {
  const { setRouter } = useContext(RouterContext)
  const [listProjects, setListProjects] = useState<Project[] | undefined>()
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')
  useEffect(() => {
    getMyProjects(page)
      .then((res) => {
        if (res.items.length) {
          setListProjects(res.items)
        }
        setTotal(res.total)
      })
      .catch((e) => {
        setError(e.message)
      })
  }, [page])
  const handleChooseProject = useCallback(
    async (projectId: number, projectName: string, permission: ProjectRole) => {
      await saveAppState(
        {
          projectId,
          projectName,
          permission,
        },
        APP_STATE_KEY,
      )
      await clearState([APP_REPORT_TAB_KEY])
      setRouter(RouterEnum.HOME)
    },
    [setRouter],
  )
  return (
    <ProjectListContainer>
      {error && (
        <Alert type="error" message={error} style={{ marginBottom: 8 }} />
      )}
      <List
        style={{ width: '100%' }}
        itemLayout="vertical"
        size="large"
        pagination={false}
        dataSource={listProjects}
        className="project-list"
        renderItem={(item) => (
          <ProjectContainer
            className="project-container"
            key={item.id}
            justify="flex-start"
            gap={'1rem'}
            onClick={() =>
              handleChooseProject(
                item.id,
                item.name,
                item.userRole?.category ?? ProjectRole.GUEST,
              )
            }
          >
            <Thumbnail imgSrc={item.projectThumbnail} />
            <ProjectMeta>
              <div className="label">{item.name}</div>
              <Paragraph className="description" ellipsis={{ rows: 2 }}>
                {item.description}
              </Paragraph>
            </ProjectMeta>
          </ProjectContainer>
        )}
      />
      <Pagination
        current={page}
        onChange={(page) => setPage(page)}
        showLessItems
        total={total}
      />
    </ProjectListContainer>
  )
}
const ProjectContainer = styled(Flex)`
  padding-block: 8px;
  height: fit-content;
  cursor: pointer;

  &:hover {
    background: #f5f5f5;
  }
`
const ProjectListContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-block: 8px;
  & > .project-list .project-container:not(:last-child) {
    border-bottom: 1px solid #d3d3d3;
  }
`
const Thumbnail = styled.div<{ imgSrc?: string }>`
  aspect-ratio: 3/2;
  height: 60px;
  background-image: url('${(props) => props.imgSrc ?? '../images/sample.png'}');
  background-size: cover;
`

const ProjectMeta = styled.div`
  & > .label {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  & > .description {
    font-size: 14px;
    margin: 0 !important;
  }
`
export default ChooseProject
