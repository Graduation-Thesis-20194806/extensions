import { CreateReportDto, ReportType, Severity } from '@/common/types/report'
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form'
import styled from 'styled-components'
import TitleWrapper from '@/common/components/TitleWrapper'
import {
  Button,
  Col,
  Flex,
  Image,
  Input,
  Radio,
  Segmented,
  Space,
  Tag,
  Upload,
  UploadFile,
} from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { AWS_URL, UNIQUE_CODE, ViewMode } from '@/common/constant'
import {
  CaretRightOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { useMemo } from 'react'
type Props = {
  onTakeScreenShot: () => void
  handleUpload: (file: any) => void
  onChangeViewMode: (value: ViewMode) => void
}
const severityList = [
  {
    label: 'Info',
    value: Severity.INFO,
    color: 'blue',
  },
  {
    label: 'Low',
    value: Severity.LOW,
    color: 'green',
  },
  {
    label: 'Medium',
    value: Severity.MEDIUM,
    color: 'orange',
  },
  {
    label: 'High',
    value: Severity.HIGH,
    color: 'red',
  },
]
export function ReportEditView({
  onTakeScreenShot,
  handleUpload,
  onChangeViewMode,
}: Props) {
  const {
    control,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CreateReportDto>()
  const imagesWatch = useWatch({ control, name: 'images' })
  const severity = useWatch({ control, name: 'severity' })
  const { fields, remove } = useFieldArray({
    control,
    name: 'additionInfo.domPosition',
  })
  const severityEntity = useMemo(() => {
    return severityList.find((item) => item.value === severity)
  }, [severity])
  const onRight = () => {
    const current = getValues('severity')
    let i = 0
    for (i = 0; i < severityList.length; i++) {
      if (severityList[i].value == current) {
        break
      }
    }
    if (i + 1 >= severityList.length) {
      i = -1
    }
    setValue('severity', severityList[i + 1].value)
  }
  return (
    <Container>
      <ReportEditContainer>
        <Flex justify="space-between" align="center">
          <Segmented<ViewMode>
            options={[ViewMode.REPORT, ViewMode.COMMENTS]}
            onChange={onChangeViewMode}
            value={ViewMode.REPORT}
            disabled={!watch('id')}
          />
          <Button htmlType="submit" type="primary">
            Submit
          </Button>
        </Flex>
        <Controller
          control={control}
          name="url"
          render={({ field: { value } }) => (
            <TitleWrapper label="Current Url">
              <Input value={value} disabled />
            </TitleWrapper>
          )}
        />
        <Controller
          control={control}
          name="name"
          rules={{
            required: 'This field is required',
          }}
          render={({ field: { value, onChange } }) => (
            <TitleWrapper label="Report Name" error={errors.name?.message}>
              <Input value={value} onChange={onChange} />
            </TitleWrapper>
          )}
        />
        <Flex align="center" justify="space-between">
          <Controller
            control={control}
            name="type"
            render={({ field: { value, onChange } }) => (
              <Radio.Group
                value={value}
                onChange={onChange}
                options={[
                  { label: 'Feedback', value: ReportType.FEEDBACK },
                  {
                    label: 'Bug',
                    value: ReportType.BUG,
                  },
                ]}
              />
            )}
          />
          <Flex style={{ cursor: 'pointer' }} onClick={onRight} align="center">
            <Tag
              style={{ width: 80, textAlign: 'center' }}
              color={severityEntity?.color}
            >
              {severityEntity?.label}
            </Tag>
            <span>
              <CaretRightOutlined
                style={{ fontSize: 18, color: 'lightgrey' }}
              />
            </span>
          </Flex>
        </Flex>
        <Controller
          control={control}
          name="description"
          rules={{
            required: 'This field is required',
          }}
          render={({ field: { value, onChange } }) => (
            <TitleWrapper
              label="Description"
              error={errors.description?.message}
            >
              <TextArea value={value} onChange={onChange} />
            </TitleWrapper>
          )}
        />
        <TitleWrapper label="ScreenShot">
          <Flex gap={4} align="center" style={{ marginBottom: 12 }}>
            <Button onClick={onTakeScreenShot}>Add screenshot</Button>
            <Upload
              accept="image/*"
              multiple={false}
              showUploadList={false}
              customRequest={({ file }) => {
                handleUpload(file)
              }}
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Flex>
          <Flex gap={12} wrap>
            {imagesWatch?.map((item, index) => (
              <a
                href={AWS_URL + '/' + item.path}
                target="_blank"
                key={item.name}
                style={{ position: 'relative' }}
              >
                <Image
                  width={150}
                  src={AWS_URL + '/' + item.path}
                  preview={false}
                />
                <DeleteImageButton
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    if (item.id)
                      setValue('deleteImages', [
                        ...(getValues('deleteImages') ?? []),
                        item.id,
                      ])
                    const images = getValues('images')

                    if (images) {
                      images?.splice(index, 1)
                      setValue('images', images)
                    }
                  }}
                >
                  x
                </DeleteImageButton>
              </a>
            ))}
          </Flex>
        </TitleWrapper>
        <TitleWrapper label="Checkpoint">
          {fields?.map((item, index) => (
            <Flex
              gap={4}
              vertical
              style={{ marginBottom: index === fields.length - 1 ? 0 : 8 }}
              key={item.id}
            >
              <Flex gap={4} align="center">
                <Controller
                  control={control}
                  name={`additionInfo.domPosition.${index}.message`}
                  render={({ field: { value, onChange } }) => (
                    <Input
                      style={{ flexGrow: 1 }}
                      value={value}
                      onChange={(e) => {
                        const message = e.target.value

                        const mess = document.getElementById(
                          `app-checkpoint-message-${UNIQUE_CODE}-${item.domId}`,
                        )
                        if (mess) {
                          mess.textContent = message ?? null
                          if (message) {
                            if (!mess.classList.contains('padding-apply'))
                              mess.classList.add('padding-apply')
                          } else {
                            if (mess.classList.contains('padding-apply'))
                              mess.classList.remove('padding-apply')
                          }
                        }
                        onChange(e)
                      }}
                    />
                  )}
                />
                <Button
                  color="danger"
                  variant="outlined"
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    const container = document.getElementById(
                      `app-checkpoint-container-${UNIQUE_CODE}-${item.domId}`,
                    )
                    if (container) container.remove()
                    remove(index)
                  }}
                />
              </Flex>
              <Controller
                control={control}
                name={`additionInfo.domPosition.${index}.domPath`}
                render={({ field: { value } }) => (
                  <TextArea value={value} disabled />
                )}
              />
            </Flex>
          ))}
        </TitleWrapper>
        <Controller
          control={control}
          name="additionInfo.browser"
          render={({ field: { value } }) => (
            <TitleWrapper label="Browser">
              <Input value={value} disabled />
            </TitleWrapper>
          )}
        />
        <Controller
          control={control}
          name="additionInfo.browserVersion"
          render={({ field: { value } }) => (
            <TitleWrapper label="Browser Version">
              <Input value={value} disabled />
            </TitleWrapper>
          )}
        />
        <Controller
          control={control}
          name="additionInfo.os"
          render={({ field: { value } }) => (
            <TitleWrapper label="Operating System">
              <Input value={value} disabled />
            </TitleWrapper>
          )}
        />
      </ReportEditContainer>
    </Container>
  )
}

const ReportEditContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const DeleteImageButton = styled.span`
  position: absolute;
  width: 16px;
  height: 16px;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  cursor: pointer;
  top: 0;
  right: 0;
  border-radius: 8px;
  transform: translate(50%, -50%);
  z-index: 1;
`

const Container = styled.div``
