import { compose, withProps } from 'recompact';
import { createSelector } from 'reselect';
import Animated from 'react-native-reanimated';
import withTransitionProps from './withTransitionProps';

const { interpolate, Value } = Animated;

const transitionPropsSelector = state => state.transitionProps;

const withBlurTransitionProps = ({
  isTransitioning,
  showingModal,
  position,
}) => {
  const blurIntensity = interpolate(position, {
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const showBlur = !!(isTransitioning || showingModal);
  return showBlur ? { blurIntensity } : { blurIntensity: new Value(0) };
};

const withBlurTransitionPropsSelector = createSelector(
  [transitionPropsSelector],
  withBlurTransitionProps,
);

export default Component => compose(
  withTransitionProps,
  withProps(withBlurTransitionPropsSelector),
)(Component);
