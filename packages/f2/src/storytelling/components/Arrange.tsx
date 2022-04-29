import Children from '../../children';
import { jsx } from '../../jsx';

export default (props) => {
  const { children } = props;
  return Children.map(Children, (child) => {
    return Children.cloneElement(child, {});
  });
};
