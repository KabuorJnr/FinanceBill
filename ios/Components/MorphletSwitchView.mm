//
//  MorphletSwitchView.mm
//  Pods
//
//  Created by rit3zh CX on 10/1/26.
//

#import "MorphletSwitchView.h"
#import "MorphletSnapshot.h"
#import "MorphletSpring.h"

#import <react/renderer/components/MorphletSpec/ComponentDescriptors.h>
#import <react/renderer/components/MorphletSpec/Props.h>
#import <react/renderer/components/MorphletSpec/RCTComponentViewHelpers.h>

#import <React/RCTFabricComponentsPlugins.h>

using namespace facebook::react;

@interface RCTViewComponentView (MorphletContainer)
- (UIView *)currentContainerView;
@end

@implementation MorphletSwitchView {
  MorphletSwitchViewTransition _transition;
  MorphletSwitchViewDirection _direction;
  CGFloat _duration;
  MorphletSpringConfig *_spring;

  NSMutableArray<UIView *> *_snapshots;
  NSMutableArray<UIView *> *_pendingOutgoing;
  NSMutableArray<UIView *> *_pendingIncoming;
  BOOL _isReady;
  BOOL _isCapturing;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider {
  return concreteComponentDescriptorProvider<MorphletSwitchViewComponentDescriptor>();
}

+ (BOOL)shouldBeRecycled {
  return NO;
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const MorphletSwitchViewProps>();
    _props = defaultProps;

    _transition = MorphletSwitchViewTransition::Morph;
    _direction = MorphletSwitchViewDirection::Forward;
    _duration = 0.25;
    _snapshots = [NSMutableArray array];
    _pendingOutgoing = [NSMutableArray array];
    _pendingIncoming = [NSMutableArray array];
  }
  return self;
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps {
  const auto &newProps = *std::static_pointer_cast<const MorphletSwitchViewProps>(props);
  _transition = newProps.transition;
  _direction = newProps.direction;
  _duration = newProps.duration;
  const auto &spring = newProps.spring;
  _spring = spring.stiffness > 0
    ? [MorphletSpringConfig springWithMass:spring.mass > 0 ? spring.mass : 1
                                 stiffness:spring.stiffness
                                   damping:spring.damping]
    : nil;

  [super updateProps:props oldProps:oldProps];
}

#pragma mark - Children

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
  UIView *container = self.currentContainerView;
  NSInteger offset = 0;
  for (UIView *snapshot in _snapshots) {
    if (snapshot.superview == container) {
      offset++;
    }
  }
  [container insertSubview:childComponentView atIndex:index + offset];

  if (_isCapturing) {
    [_pendingIncoming addObject:childComponentView];
  }
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
  [childComponentView removeFromSuperview];
  [_pendingIncoming removeObject:childComponentView];
}

- (nullable UIView *)childWithTag:(NSInteger)tag {
  for (UIView *subview in self.currentContainerView.subviews) {
    if (subview.tag == tag && ![_snapshots containsObject:subview]) {
      return subview;
    }
  }
  return nil;
}

#pragma mark - RCTMountingTransactionObserving

- (void)mountingTransactionWillMount:(const MountingTransaction &)transaction
                withSurfaceTelemetry:(const SurfaceTelemetry &)surfaceTelemetry {
  _isCapturing = _isReady && self.window != nil;
  if (!_isCapturing) {
    return;
  }

  const auto tag = static_cast<Tag>(self.tag);
  for (const auto &mutation : transaction.getMutations()) {
    if (mutation.type != ShadowViewMutation::Remove || mutation.parentTag != tag) {
      continue;
    }

    UIView *child = [self childWithTag:mutation.oldChildShadowView.tag];
    UIView *snapshot = child ? [self snapshotOfView:child] : nil;
    if (snapshot) {
      [_pendingOutgoing addObject:snapshot];
    }
  }
}

- (void)mountingTransactionDidMount:(const MountingTransaction &)transaction
               withSurfaceTelemetry:(const SurfaceTelemetry &)surfaceTelemetry {
  BOOL wasCapturing = _isCapturing;
  _isCapturing = NO;
  _isReady = YES;

  NSArray<UIView *> *outgoing = [_pendingOutgoing copy];
  NSArray<UIView *> *incoming = [_pendingIncoming copy];
  [_pendingOutgoing removeAllObjects];
  [_pendingIncoming removeAllObjects];

  if (!wasCapturing || (outgoing.count == 0 && incoming.count == 0)) {
    return;
  }

  [self transitionFrom:outgoing to:incoming];
}

#pragma mark - Transition

- (nullable UIView *)snapshotOfView:(UIView *)view {
  UIView *snapshot = MorphletSnapshotView(view);
  if (!snapshot) {
    return nil;
  }
  snapshot.center = view.center;

  CALayer *presentation = view.layer.presentationLayer;
  snapshot.transform = presentation ? CATransform3DGetAffineTransform(presentation.transform) : view.transform;
  snapshot.alpha = presentation ? presentation.opacity : view.alpha;
  return snapshot;
}

- (CGFloat)verticalShiftForView:(UIView *)view {
  return MIN(100, view.bounds.size.height * 0.5);
}

- (CGAffineTransform)enterTransformForView:(UIView *)view {
  CGFloat sign = _direction == MorphletSwitchViewDirection::Backward ? -1 : 1;
  switch (_transition) {
    case MorphletSwitchViewTransition::Morph:
      return CGAffineTransformScale(CGAffineTransformMakeTranslation(0, -[self verticalShiftForView:view]), 1.05, 1.05);
    case MorphletSwitchViewTransition::Slide:
      return CGAffineTransformMakeTranslation(self.bounds.size.width * sign, 0);
    case MorphletSwitchViewTransition::Scale:
      return CGAffineTransformMakeScale(0.8, 0.8);
    case MorphletSwitchViewTransition::Fade:
      return CGAffineTransformIdentity;
  }
  return CGAffineTransformIdentity;
}

- (CGAffineTransform)exitTransformForView:(UIView *)view {
  CGFloat sign = _direction == MorphletSwitchViewDirection::Backward ? -1 : 1;
  switch (_transition) {
    case MorphletSwitchViewTransition::Morph:
      return CGAffineTransformScale(CGAffineTransformMakeTranslation(0, [self verticalShiftForView:view]), 0.95, 0.95);
    case MorphletSwitchViewTransition::Slide:
      return CGAffineTransformMakeTranslation(-self.bounds.size.width * sign, 0);
    case MorphletSwitchViewTransition::Scale:
      return CGAffineTransformMakeScale(0.8, 0.8);
    case MorphletSwitchViewTransition::Fade:
      return CGAffineTransformIdentity;
  }
  return CGAffineTransformIdentity;
}

- (void)transitionFrom:(NSArray<UIView *> *)outgoing to:(NSArray<UIView *> *)incoming {
  UIView *container = self.currentContainerView;

  [UIView performWithoutAnimation:^{
    for (UIView *snapshot in outgoing) {
      [container insertSubview:snapshot atIndex:self->_snapshots.count];
      [self->_snapshots addObject:snapshot];
    }
    for (UIView *view in incoming) {
      view.alpha = 0;
      view.transform = [self enterTransformForView:view];
    }
  }];

  NSMutableArray<NSValue *> *exitTransforms = [NSMutableArray arrayWithCapacity:outgoing.count];
  for (UIView *snapshot in outgoing) {
    [exitTransforms addObject:[NSValue valueWithCGAffineTransform:[self exitTransformForView:snapshot]]];
  }

  __weak __typeof(self) weakSelf = self;
  MorphletSpringConfig *spring = _spring ?: [MorphletSpringConfig springWithResponse:_duration dampingFraction:0.7];
  [MorphletSpring animateWithSpring:spring
    velocity:0
    animations:^{
      for (UIView *view in incoming) {
        view.alpha = 1;
        view.transform = CGAffineTransformIdentity;
      }
      for (NSUInteger i = 0; i < outgoing.count; i++) {
        outgoing[i].alpha = 0;
        outgoing[i].transform = exitTransforms[i].CGAffineTransformValue;
      }
    }
    completion:^(BOOL finished) {
      __typeof(self) strongSelf = weakSelf;
      for (UIView *snapshot in outgoing) {
        [snapshot removeFromSuperview];
        if (strongSelf) {
          [strongSelf->_snapshots removeObject:snapshot];
        }
      }
    }];
}

@end

Class<RCTComponentViewProtocol> MorphletSwitchViewCls(void) {
  return MorphletSwitchView.class;
}
