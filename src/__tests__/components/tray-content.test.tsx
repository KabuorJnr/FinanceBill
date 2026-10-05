import { describe, expect, it } from '@jest/globals';
import { act, render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { TRAY_DEFAULTS } from '../../constants';
import { Tray } from '../../root';
import { resolveAnimation } from '../../utils';
import { containerViews, hostView } from '../helpers/native';

describe('Tray.Content', () => {
  it('passes its defaults to the native tray', () => {
    render(
      <Tray.Root defaultOpen>
        <Tray.Content>
          <Text>Body</Text>
        </Tray.Content>
      </Tray.Root>
    );

    expect(hostView().props).toMatchObject({
      cornerRadius: TRAY_DEFAULTS.CORNER_RADIUS,
      cornerSmoothing: TRAY_DEFAULTS.CORNER_SMOOTHING,
      bottomOffset: TRAY_DEFAULTS.BOTTOM_OFFSET,
      backdropOpacity: TRAY_DEFAULTS.BACKDROP_OPACITY,
      dismissible: true,
      draggable: true,
      fadeOnDrag: true,
      fullScreen: false,
      stack: false,
    });
  });

  it('forwards presentation options', () => {
    render(
      <Tray.Root defaultOpen>
        <Tray.Content
          stack
          fadeOnDrag={false}
          dismissible={false}
          cornerRadius={20}
        >
          <Text>Body</Text>
        </Tray.Content>
      </Tray.Root>
    );

    expect(hostView().props).toMatchObject({
      stack: true,
      fadeOnDrag: false,
      dismissible: false,
      cornerRadius: 20,
    });
  });

  it('moves background color and radius from style onto the card', () => {
    render(
      <Tray.Root defaultOpen>
        <Tray.Content
          style={{ backgroundColor: 'black', borderRadius: 24, padding: 8 }}
        >
          <Text>Body</Text>
        </Tray.Content>
      </Tray.Root>
    );

    const [container] = containerViews();
    const containerStyle = Object.assign(
      {},
      ...[container!.props.style].flat(3)
    );

    expect(hostView().props.cardColor).toBe('black');
    expect(hostView().props.cornerRadius).toBe(24);
    expect(containerStyle.backgroundColor).toBeUndefined();
    expect(containerStyle.padding).toBe(8);
  });

  it('caps the floating height and fills the screen when full screen', () => {
    const { rerender } = render(
      <Tray.Root defaultOpen>
        <Tray.Content>
          <Text>Body</Text>
        </Tray.Content>
      </Tray.Root>
    );
    const style = () =>
      Object.assign({}, ...[containerViews()[0]!.props.style].flat(3));

    expect(style().maxHeight).toBeGreaterThan(0);
    expect(style().height).toBeUndefined();

    rerender(
      <Tray.Root defaultOpen>
        <Tray.Content fullScreen>
          <Text>Body</Text>
        </Tray.Content>
      </Tray.Root>
    );

    expect(style().height).toBeGreaterThan(0);
    expect(hostView().props.fullScreen).toBe(true);
  });

  it('pads full-screen content by the safe area reported natively', () => {
    render(
      <Tray.Root defaultOpen>
        <Tray.Content fullScreen>
          <Text>Body</Text>
        </Tray.Content>
      </Tray.Root>
    );

    act(() =>
      hostView().props.onInsetsChange({
        nativeEvent: {
          top: 62,
          bottom: 34,
          keyboard: 0,
          width: 440,
          height: 956,
        },
      })
    );

    const style = Object.assign(
      {},
      ...[containerViews()[0]!.props.style].flat(3)
    );
    expect(style.paddingTop).toBe(62);
    expect(style.paddingBottom).toBe(34);
  });

  it('resolves the animation preset into native springs', () => {
    render(
      <Tray.Root defaultOpen animation="bouncy">
        <Tray.Content>
          <Text>Body</Text>
        </Tray.Content>
      </Tray.Root>
    );

    const springs = resolveAnimation('bouncy', TRAY_DEFAULTS.DURATION);
    expect(hostView().props).toMatchObject({
      presentSpring: springs.present,
      dismissSpring: springs.dismiss,
      morphSpring: springs.morph,
      layoutSpring: springs.layout,
      snapSpring: springs.drag,
    });
  });
});
