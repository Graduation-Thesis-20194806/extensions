import styled from 'styled-components'

const LogoContainer = styled.h1<{ fontSize: number }>`
  font-family: 'Montserrat', sans-serif;
  font-size: ${(props) => props.fontSize}px;
  font-weight: bold;
  margin: 0;
`
const Logo = ({ fontSize }: { fontSize?: number }) => {
  return (
    <LogoContainer fontSize={fontSize ?? 24}>
      A Task Management Tool
    </LogoContainer>
  )
}

export default Logo
