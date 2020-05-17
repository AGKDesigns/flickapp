import React from "react";
import styled from "styled-components";
import { StyleSheet, Text, View, Image } from "react-native";

const ListCard = (props) => (
  <Container>
    <BGImage source={props.image} />
    <GradientOverlay source={require("../assets/img/ListGradient.png")} />
    <TextContainer>
      <Title>{props.title}</Title>
      <MovieCount>10 / 100 Watched</MovieCount>
    </TextContainer>
  </Container>
);

const Container = styled.View`
  background-color: black;
  height: 200px;
  border-radius: 14px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  margin-left: 16px;
  margin-right: 16px;
  margin-top: 24px;
  overflow: hidden;
`;

const BGImage = styled.Image`
  position: absolute;
  width: 100%;
  height: 100%;
`;

const GradientOverlay = styled.Image`
  height: 200px;

  position: absolute;
`;

const TextContainer = styled.View`
  align-self: flex-end;

  height: 100%;
  padding-bottom: 16px;
  padding-right: 16px;
  justify-content: flex-end;
`;

const Title = styled.Text`
  font-size: 32;
  color: #fff;
  justify-content: center;
  font-style: normal;
  font-weight: bold;
  text-align: right;
`;

const MovieCount = styled.Text`
  font-style: normal;
  font-weight: bold;
  font-size: 17;
  color: #fff;
  text-align: right;
`;

export default ListCard;
