import { FC } from 'react'
import styled from 'styled-components'

type TitleWrapperProps = {
  label: string
  error?: string
  children: React.ReactNode
  note?: React.ReactNode
  isRequired?: boolean
}

const TitleWrapper: FC<TitleWrapperProps> = ({
  label,
  children,
  note,
  error = '',
  isRequired = false,
}) => {
  return (
    <TitleWrapperContainer>
      <LabelContainer>
        {label}
        {isRequired && (
          <span className="text-white text-[11px] leading-[150%] bg-error-color rounded-[2px] p-1 font-normal ml-1">
            *
          </span>
        )}
      </LabelContainer>
      {children}
      {!error && !!note && (
        <p className="text-gray-500 text-xs text-end leading-5 min-h-5 my-[2px]">
          {note}
        </p>
      )}
      {error && <ErrorContainer>{error}</ErrorContainer>}
    </TitleWrapperContainer>
  )
}

export default TitleWrapper

const TitleWrapperContainer = styled.div`
  width: 100%;
`
const LabelContainer = styled.p`
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 6px;
  color: black;
  margin-top: 0 !important;
`
const ErrorContainer = styled.p`
  color: red;
  font-size: 10px;
  margin-block: 2px;
`
