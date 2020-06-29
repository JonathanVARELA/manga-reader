import React, {Component} from "react";
import styled, {keyframes} from "styled-components";

const BounceAnimation = keyframes`
  0% { margin-bottom: 0; }
  50% { margin-bottom: 15px }
  100% { margin-bottom: 0 }
`;
const DotWrapper = styled.div`
  display: flex;
  align-items: flex-end;
`;
const Dot = styled.div`
  border-radius: 50%;
  width: 10px;
  height: 10px;
  margin: 0 5px;  /* Animation */
  animation: ${BounceAnimation} 0.5s linear infinite;
  animation-delay: ${props => props.delay};
`;

class LoadingDots extends Component {
    render() {
        return (
            <DotWrapper>
                <Dot style={{backgroundColor: this.props.color}} delay="0s"/>
                <Dot style={{backgroundColor: this.props.color}} delay=".1s"/>
                <Dot style={{backgroundColor: this.props.color}} delay=".2s"/>
            </DotWrapper>
        )
    }
}

export default LoadingDots