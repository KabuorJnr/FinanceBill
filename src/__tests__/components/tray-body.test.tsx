import { describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { Tray, useTray } from '../../root';
import { hostView, switchViews } from '../helpers/native';

const Navigate = ({ to }: { to: string }) => {
  const { setView } = useTray();
  return (
    <Pressable onPress={() => setView(to)}>
      <Text>Go {to}</Text>
    </Pressable>
  );
};

const Back = () => {
  const { goBack, canGoBack } = useTray();
  return (
    <Pressable onPress={goBack}>
      <Text>{canGoBack ? 'Back' : 'Root'}</Text>
    </Pressable>
  );
};

const Views = (props: Parameters<typeof Tray.Root>[0]) => (
  <Tray.Root defaultOpen {...props}>
    <Back />
    <Tray.Content>
      <Tray.Body>
        <Tray.View name="options">
          <Text>Options</Text>
          <Navigate to="details" />
        </Tray.View>
        <Tray.View name="details">
          <Text>Details</Text>
          <Navigate to="group" />
        </Tray.View>
        <Tray.View name="group" fullScreen>
          <Text>Group</Text>
        </Tray.View>
      </Tray.Body>
    </Tray.Content>
  </Tray.Root>
);

describe('Tray.Body and Tray.View', () => {
  it('shows the first view by default', () => {
    render(<Views />);

    expect(screen.getByText('Options')).toBeTruthy();
    expect(screen.queryByText('Details')).toBeNull();
    expect(screen.getByText('Root')).toBeTruthy();
  });

  it('navigates forward and back, telling native the direction', () => {
    render(<Views />);

    fireEvent.press(screen.getByText('Go details'));

    expect(screen.getByText('Details')).toBeTruthy();
    expect(switchViews()[0]!.props.direction).toBe('forward');

    fireEvent.press(screen.getByText('Back'));

    expect(screen.getByText('Options')).toBeTruthy();
    expect(switchViews()[0]!.props.direction).toBe('backward');
  });

  it('goes full screen while a full-screen view is active', () => {
    render(<Views />);

    expect(hostView().props.fullScreen).toBe(false);

    fireEvent.press(screen.getByText('Go details'));
    fireEvent.press(screen.getByText('Go group'));

    expect(hostView().props.fullScreen).toBe(true);

    fireEvent.press(screen.getByText('Back'));

    expect(hostView().props.fullScreen).toBe(false);
  });

  it('reports view changes and follows a controlled view', () => {
    const onViewChange = jest.fn();
    const { rerender } = render(
      <Views view="options" onViewChange={onViewChange} />
    );

    fireEvent.press(screen.getByText('Go details'));
    expect(onViewChange).toHaveBeenCalledWith('details');

    rerender(<Views view="details" onViewChange={onViewChange} />);
    expect(screen.getByText('Details')).toBeTruthy();
  });

  it('returns to the first view after closing', () => {
    render(<Views />);

    fireEvent.press(screen.getByText('Go details'));
    act(() => hostView().props.onWillDismiss());
    act(() => hostView().props.onDidDismiss());

    expect(hostView().props.open).toBe(false);
    expect(screen.getByText('Root')).toBeTruthy();
  });

  it('keeps the view after closing with resetOnClose disabled', () => {
    const onViewChange = jest.fn();
    render(<Views resetOnClose={false} onViewChange={onViewChange} />);

    fireEvent.press(screen.getByText('Go details'));
    act(() => hostView().props.onWillDismiss());
    act(() => hostView().props.onDidDismiss());

    expect(onViewChange).toHaveBeenLastCalledWith('details');
  });
});

describe('Tray.Morph', () => {
  it('keys its child by value so native can morph between them', () => {
    const { rerender } = render(
      <Tray.Morph value="a">
        <Text>A</Text>
      </Tray.Morph>
    );
    const first = switchViews()[0]!.children[0];

    rerender(
      <Tray.Morph value="b">
        <Text>B</Text>
      </Tray.Morph>
    );

    expect(switchViews()[0]!.children[0]).not.toBe(first);
    expect(screen.getByText('B')).toBeTruthy();
  });

  it('uses the given transition outside a tray', () => {
    render(
      <Tray.Morph value={1} transition="slide">
        <Text>One</Text>
      </Tray.Morph>
    );

    expect(switchViews()[0]!.props).toMatchObject({
      transition: 'slide',
      direction: 'forward',
    });
  });
});
