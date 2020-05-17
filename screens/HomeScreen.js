import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, Animated, Easing, StatusBar } from "react-native";
import styled from "styled-components";
import BGimg from "../assets/img/BGGrad.png";
import ListCard from "../components/listCard";
import { ScrollView } from "react-native";
import Menu from "../components/Menu";
import { connect } from "react-redux";

function mapStateToProps(state) {
  return { action: state.action };
}

function mapDispatchToProps(dispatch) {
  return {
    openMenu: () =>
      dispatch({
        type: "OPEN_MENU",
      }),
  };
}

class HomeScreen extends React.Component {
  state = {
    scale: new Animated.Value(1),
    opacity: new Animated.Value(1),
  };

  componentDidUpdate() {
    this.toggleMenu();
  }

  componentDidMount() {
    StatusBar.setBarStyle("light-content", true);
  }

  toggleMenu = () => {
    if (this.props.action == "openMenu") {
      Animated.timing(this.state.scale, {
        toValue: 1,
        duration: 300,
        easing: Easing.in(),
      }).start();
      Animated.spring(this.state.opacity, {
        toValue: 0.5,
      }).start();

      StatusBar.setBarStyle("light-content", true);
    }

    if (this.props.action == "closeMenu") {
      Animated.spring(this.state.scale, {
        toValue: 1,
        duration: 300,
        easing: Easing.in(),
      }).start();
      Animated.spring(this.state.opacity, {
        toValue: 1,
      }).start();
    }
  };

  render() {
    return (
      <RootView>
        <Menu />
        <AnimatedContainer style={{ transform: [{ scale: this.state.scale }], opacity: this.state.opacity }}>
          <BackgroundGlow source={require("../assets/img/BGGrad.png")}></BackgroundGlow>

          <AppHeader>
            <TouchableOpacity onPress={this.props.openMenu}>
              <Hamburger source={require("../assets/img/ic_hamburger.png")} />
            </TouchableOpacity>
            <AppLogo source={require("../assets/img/FlickApp_TopLogo.png")}></AppLogo>
            <Badge source={require("../assets/img/ic_badges.png")} />
          </AppHeader>
          <ScrollView
            horizontal={false}
            vertical={true}
            style={{ paddingBottom: 50 }}
            showsHorizontalScrollIndicator={false}
          >
            <Content>
              {Lists.map((listitem, index) => (
                <ListCard key={index} image={listitem.image} title={listitem.title} />
              ))}
              <AppFooter>
                <FooterText>Made with ❤️ in Tokyo</FooterText>
              </AppFooter>
            </Content>
          </ScrollView>
        </AnimatedContainer>
      </RootView>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);

const RootView = styled.View`
  background: black;
  flex: 1;
`;

const Container = styled.View`
  background-color: #000;
  width: 100%;
  flex: 1;
  border-radius: 10px;
`;

const AnimatedContainer = Animated.createAnimatedComponent(Container);

const Hamburger = styled.Image`
  width: 24px;
  height: 24px;
`;

const Badge = styled.Image`
  width: 24px;
  height: 24px;
  margin-right: 24px;
`;

const AppLogo = styled.Image`
  width: 158px;
  height: 74px;
`;

const BackgroundGlow = styled.Image`
  position: absolute;
  width: 100%;
  overflow: hidden;
  height: 25%;
`;

const Content = styled.View``;

const AppHeader = styled.View`
  width: 100%;
  margin-top: 50px;
  padding-left: 20px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
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

const AppFooter = styled.View`
  height: 100px;
  justify-content: center;
  align-items: center;
`;

const FooterText = styled.Text`
  color: #aaa;
`;

const Lists = [
  {
    title: "Top 100 movies",
    image: require("../assets/img/ListCardBG01.png"),
  },
  {
    title: "Best Horror",
    image: require("../assets/img/TheConjouring.jpg"),
  },
  {
    title: "Laughable Movies",
    image: require("../assets/img/stepbrothers.jpeg"),
  },
  {
    title: "Best of 2019",
    image: require("../assets/img/parasite.jpg"),
  },
];
