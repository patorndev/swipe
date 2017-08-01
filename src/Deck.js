import React, { Component } from 'react';
import { View, 
  Animated, 
  PanResponder, 
  Dimensions,
  LayoutAnimation,
  UIManager
 } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;


class Deck extends Component {
  // if the component is not passed in the props, the component itself will use this function
  static defaultProps = {
    onSwipeRight: () => {},
    onSwipeLeft: () => {},
  }

  constructor(props) {
    super(props);

    const position = new Animated.ValueXY();
    // PanResponder is self contain object; never calls setstate on.
    const panResponder = PanResponder.create({
      // execute anytime user press on the screen
      onStartShouldSetPanResponder: () => true,

      // call user drag around the screen
      onPanResponderMove: (e, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },

      // call anytime user let go off the screen
      // e.g.finalise callback
      onPanResponderRelease: (e, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          this.forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          this.forceSwipe('left');
        } else {
          this.resetPosition();
        }
      }
    });

    this.state = { panResponder, position, index: 0 }; // initial index
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) { // compare the incomming set of array to the current set of array
      this.setState({ index: 0 })
    }
  }
  
  componentWillUpdate() {
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true); // for android device
    LayoutAnimation.spring(); // next time it re-render, it need to animate every changes.
  }
  getCardStyle() {
    const { position } = this.state; // destruction
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5], // width of device
      outputRange: ['-120deg', '0deg', '120deg'] // rotation output
    });

    return {
      ...position.getLayout(), // return an object position
      transform: [{ rotate }]
    };
  }

  forceSwipe(direction) {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;

    Animated.timing(this.state.position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION
    }).start(() => this.onSwipeComplete(direction));
  }

  onSwipeComplete(direction) {
    const { onSwipeLeft, onSwipeRight, data } = this.props;
    const item = data[this.state.index];

    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    // reset position of the card, otherwise it will be in the same position as the previos card
    this.state.position.setValue({ x: 0, y: 0 }); 
    this.setState({ index: this.state.index + 1 });
  }

  resetPosition() {
    Animated.spring(this.state.position, {
      toValue: { x: 0, y: 0 }
    }).start();
  }

  renderCards() {
    if(this.state.index >= this.props.data.length) {
      return this.props.renderNoMoreCards();
    }

    return this.props.data.map((item, i) => {
      if(i < this.state.index) { return null; }

      if (i === this.state.index) {
        return (
          // assign a key prop
          <Animated.View
            key={item.id}
            style={[this.getCardStyle(), styles.cardStyle]}
            {...this.state.panResponder.panHandlers}
          >
            {this.props.renderCard(item)}
          </Animated.View>
        );
      }
      return (
        // top: 10 * (i - this.state.index) distance between each card to the top
        <Animated.View 
          key={item.id}
          style={[styles.cardStyle, { top: 10 * (i - this.state.index) }]}
        >
          {this.props.renderCard(item)}
        </Animated.View>
      );
    }).reverse();
  }

  render() {
    return (
      // ... pass all the different callbacks on panHandlers to View
      <View>
        {this.renderCards()}
      </View>
    );
  }
}

const styles = {
  cardStyle: {
    position:'absolute',
    width: SCREEN_WIDTH,
  }
};

export default Deck;
