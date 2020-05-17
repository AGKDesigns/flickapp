import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import styled from "styled-components";
import BGimg from "./assets/img/BGGrad.png";

export default class App extends React.Component {
  render() {
    return (
      <Container>
        <BackgroundGlow source={require("./assets/img/BGGrad.png")}></BackgroundGlow>

        <AppHeader>
          <Hamburger source={require("./assets/img/ic_hamburger.png")} />
          <AppLogo source={require("./assets/img/FlickApp_TopLogo.png")}></AppLogo>
          <Badge source={require("./assets/img/ic_badges.png")} />
        </AppHeader>
        <Content>
          <Title>This is where my content will go</Title>
        </Content>
      </Container>
    );
  }
}

const Container = styled.View`
  background-color: #000;
  width: 100%;
  flex: 1;
`;

const Hamburger = styled.Image`
  width: 24px;
  height: 24px;
`;

const Badge = styled.Image`
  width: 24px;
  height: 24px;
`;

const AppLogo = styled.Image`
  width: 158px;
  height: 74px;
  align-items: center;
`;

const BackgroundGlow = styled.Image`
  position: absolute;
  width: 100%;
  overflow: hidden;
`;

const Content = styled.View``;

const AppHeader = styled.View`
  width: 100%;
  margin-top: 50px;
  padding-left: 20px;
  flex-direction: row;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 16px;
  color: #b8bece;
  font-weight: 500;
`;

const Name = styled.Text`
  font-size: 20px;
  color: #b8bece;
  font-weight: bold;
`;
