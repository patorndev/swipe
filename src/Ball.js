import React, { Component } from 'react';
import { View, Animated } from 'react-native';

class Ball extends Component {
  componentWillMount() {
    // Animated.ValueXY start(0,0)
    this.position = new Animated.ValueXY(0, 0);
    // Animated.spring is used to change value of element
    Animated.spring(this.position, {
      // Set explicitly as an object = finish: { x: 200, y: 500 }
      toValue: { x: 200, y: 500 }
    }).start();
  }

  render() {
    return (
      // Element inside Animated.View to modify position
      // pasing ValueXY as prop
      <Animated.View style={this.position.getLayout()}>
        <View style={styles.ball} />
      </Animated.View>
    );
  }
}

const styles = {
  ball: {
    height: 60,
    width: 60,
    borderRadius: 30,
    borderWidth: 30,
    borderColor: 'black',
  }
};

export default Ball;
