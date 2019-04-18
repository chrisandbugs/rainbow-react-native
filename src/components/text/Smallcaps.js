import { withProps } from 'recompact';
import Text from './Text';

export default withProps(({ style }) => ({
  color: 'blueGreyMedium',
  letterSpacing: 'loose',
  size: 'smaller',
  style: [{ textTransform: 'uppercase' }, style],
  weight: 'semibold',
}))(Text);