import React from "react";
import styled from "styled-components";
import { Animated, TouchableOpacity, Dimensions, Text } from "react-native";
import { connect } from "react-redux";
import { and } from "react-native-reanimated";

function mapStateToProps(state) {
  return { action: state.action };
}

function mapDispatchToProps(dispatch) {
  return {
    closeMenu: () =>
      dispatch({
        type: "CLOSE_MENU",
      }),
  };
}

const screenHeight = Dimensions.get("window").height;

class Menu extends React.Component {
  state = {
    top: new Animated.Value(screenHeight),
  };

  componentDidMount() {
    this.toggleMenu();
  }

  componentDidUpdate() {
    this.toggleMenu();
  }

  toggleMenu = () => {
    if (this.props.action == "openMenu") {
      Animated.spring(this.state.top, {
        toValue: 54,
      }).start();
    }

    if (this.props.action == "closeMenu") {
      Animated.spring(this.state.top, {
        toValue: screenHeight,
      }).start();
    }
  };

  render() {
    return (
      <AnimatedContainer style={{ top: this.state.top }}>
        <Cover>
          <TouchableOpacity onPress={this.props.closeMenu}>
            <CloseView>
              <Hamburger source={require("../assets/img/ic_hamburger.png")} />
            </CloseView>
          </TouchableOpacity>
        </Cover>
        <Content>
          <SignedInText>THis is my menu content</SignedInText>
        </Content>
      </AnimatedContainer>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu);

const Container = styled.View`
  position: absolute;
  background: black;
  width: 100%;
  height: 100%;
  z-index: 100;
  border-radius: 10px;
  overflow: hidden;
`;

const AnimatedContainer = Animated.createAnimatedComponent(Container);

const Cover = styled.View`
  height: 142px;
  background: black;
`;

const Content = styled.View`
  height: ${screenHeight};
`;

const Hamburger = styled.Image`
  width: 24px;
  height: 24px;
`;

const CloseView = styled.View`
  padding-left: 30px;
  padding-top: 30px;
`;

const SignedInText = styled.Text`
  color: white;
`;
